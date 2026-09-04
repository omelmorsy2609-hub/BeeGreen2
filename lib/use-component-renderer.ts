"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { RenderRequest, RenderResponse } from "./openscad-worker"

export interface ComponentRenderResult {
  id: string
  ok: boolean
  buffer?: ArrayBuffer
  error?: string
}

interface PendingEntry {
  componentId: string
  resolve: (result: ComponentRenderResult) => void
}

interface UseComponentRendererResult {
  /** Renders several independent OpenSCAD snippets and resolves once all are done. */
  renderComponents: (sources: { id: string; source: string }[]) => Promise<ComponentRenderResult[]>
  isRendering: boolean
}

let nextRequestId = 0

// This is intentionally a *separate* worker from the one useOpenScad uses
// for the merged full-model preview / STL download, so per-component
// editing never contends with (or gets dropped by) that single-flight
// render. It reuses the exact same openscad-worker.ts message protocol —
// every request carries its own id, so many small renders can be in
// flight at once and are resolved independently as their responses come
// back, in whatever order the worker finishes them.
export function useComponentRenderer(): UseComponentRendererResult {
  const [pendingCount, setPendingCount] = useState(0)
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef<Map<number, PendingEntry>>(new Map())

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      const worker = new Worker(new URL("./openscad-worker.ts", import.meta.url), {
        type: "module",
      })
      worker.addEventListener("message", (event: MessageEvent<RenderResponse>) => {
        if (event.data.type === "engine-ready") return

        const entry = pendingRef.current.get(event.data.id)
        if (!entry) return
        pendingRef.current.delete(event.data.id)
        setPendingCount(pendingRef.current.size)

        entry.resolve(
          event.data.ok
            ? { id: entry.componentId, ok: true, buffer: event.data.buffer }
            : { id: entry.componentId, ok: false, error: event.data.error },
        )
      })
      workerRef.current = worker
    }
    return workerRef.current
  }, [])

  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
      pendingRef.current.clear()
    }
  }, [])

  const renderComponents = useCallback(
    (sources: { id: string; source: string }[]) => {
      if (sources.length === 0) return Promise.resolve<ComponentRenderResult[]>([])

      const worker = getWorker()
      const promises = sources.map(
        ({ id, source }) =>
          new Promise<ComponentRenderResult>((resolve) => {
            const requestId = ++nextRequestId
            pendingRef.current.set(requestId, { componentId: id, resolve })
            setPendingCount(pendingRef.current.size)
            const message: RenderRequest = { id: requestId, source }
            worker.postMessage(message)
          }),
      )
      return Promise.all(promises)
    },
    [getWorker],
  )

  return { renderComponents, isRendering: pendingCount > 0 }
}
