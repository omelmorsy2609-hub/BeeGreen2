/// <reference lib="webworker" />

// Runs the OpenSCAD WASM engine inside a Web Worker. Compiling a script
// (especially one with lots of CSG booleans) can take anywhere from
// milliseconds to a minute or more, and callMain() is synchronous/blocking.
// Doing that on the main thread freezes the whole page — the UI can't even
// repaint the loading spinner. Running it here keeps the tab responsive no
// matter how heavy the model is.

export interface RenderRequest {
  id: number
  source: string
}

export type RenderResponse =
  | { id: number; type: "engine-ready" }
  | { id: number; type: "done"; ok: true; buffer: ArrayBuffer }
  | { id: number; type: "done"; ok: false; error: string }

const NOISE_LINES = ["Could not initialize localization"]

self.onmessage = async (event: MessageEvent<RenderRequest>) => {
  const { id, source } = event.data
  const logs: string[] = []

  try {
    const { createOpenSCAD } = await import("openscad-wasm")

    // A fresh engine instance is created for every render. The engine's
    // internal WASM runtime is not safe to reuse for a second callMain
    // in the same instance — it throws on the second call — so caching
    // a single instance across renders is intentionally avoided.
    const engine = await createOpenSCAD({
      noInitialRun: true,
      print: (text: string) => logs.push(text),
      printErr: (text: string) => logs.push(text),
    })

    const readyMessage: RenderResponse = { id, type: "engine-ready" }
    self.postMessage(readyMessage)

    const instance = engine.getInstance()
    instance.FS.writeFile("/input.scad", source)

    // --enable=manifold switches the CSG backend from CGAL to Manifold,
    // which is dramatically faster for scripts with many boolean
    // operations (unions/differences), like grids of holes or repeated
    // patterns. This is the single biggest lever for avoiding long
    // main-thread-equivalent stalls on heavy models.
    const exitCode = instance.callMain(["/input.scad", "--enable=manifold", "-o", "/output.stl"])

    const output = instance.FS.readFile("/output.stl", { encoding: "binary" })
    const buffer = output.buffer.slice(
      output.byteOffset,
      output.byteOffset + output.byteLength,
    ) as ArrayBuffer

    if (exitCode !== 0 || buffer.byteLength === 0) {
      throw new Error("OpenSCAD did not produce a model from this script.")
    }

    const doneMessage: RenderResponse = { id, type: "done", ok: true, buffer }
    // Transfer the buffer's underlying memory instead of copying it.
    self.postMessage(doneMessage, [buffer])
  } catch (err) {
    const detail = logs
      .filter((line) => line && !NOISE_LINES.some((noise) => line.includes(noise)))
      .join("\n")
    const fallback = err instanceof Error ? err.message : "OpenSCAD failed to render this script."
    const doneMessage: RenderResponse = { id, type: "done", ok: false, error: detail || fallback }
    self.postMessage(doneMessage)
  }
}
