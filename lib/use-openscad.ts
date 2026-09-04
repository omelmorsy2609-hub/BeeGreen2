"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { RenderRequest, RenderResponse } from "./openscad-worker"

export type OpenScadStatus = "idle" | "loading-engine" | "rendering" | "ready" | "error"

interface UseOpenScadResult {
  status: OpenScadStatus
  error: string | null
  stlBuffer: ArrayBuffer | null
  render: (source: string) => void
  reset: () => void
}

let nextRequestId = 0

export function useOpenScad(): UseOpenScadResult {
  const [status, setStatus] = useState<OpenScadStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [stlBuffer, setStlBuffer] = useState<ArrayBuffer | null>(null)

  // The OpenSCAD engine runs in a Web Worker (see openscad-worker.ts) so
  // compiling a heavy script never blocks the main thread / freezes the UI.
  const workerRef = useRef<Worker | null>(null)
  const activeIdRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  const render = useCallback((source: string) => {
    if (activeIdRef.current !== null) return // a render is already in flight

    if (!workerRef.current) {
      workerRef.current = new Worker(new URL("./openscad-worker.ts", import.meta.url), {
        type: "module",
      })
    }
    const worker = workerRef.current

    const id = ++nextRequestId
    activeIdRef.current = id
    setError(null)
    setStlBuffer(null)
    setStatus("loading-engine")

    const handleMessage = (event: MessageEvent<RenderResponse>) => {
      // Ignore stale messages from a render that was superseded by a newer one.
      if (event.data.id !== id) return

      if (event.data.type === "engine-ready") {
        setStatus("rendering")
        return
      }

      worker.removeEventListener("message", handleMessage)
      activeIdRef.current = null

      if (event.data.ok) {
        setStlBuffer(event.data.buffer)
        setStatus("ready")
      } else {
        setError(event.data.error)
        setStatus("error")
      }
    }

    worker.addEventListener("message", handleMessage)
    const request: RenderRequest = { id, source }
    worker.postMessage(request)
  }, [])

  const reset = useCallback(() => {
    activeIdRef.current = null
    setStlBuffer(null)
    setError(null)
    setStatus("idle")
  }, [])

  return { status, error, stlBuffer, render, reset }
}
