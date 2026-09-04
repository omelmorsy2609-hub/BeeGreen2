"use client"

import { useCallback, useState } from "react"

export type TextToScadStatus = "idle" | "generating" | "ready" | "error"

interface UseTextToScadResult {
  status: TextToScadStatus
  error: string | null
  generate: (description: string) => Promise<string | null>
  reset: () => void
}

export function useTextToScad(): UseTextToScadResult {
  const [status, setStatus] = useState<TextToScadStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (description: string): Promise<string | null> => {
    setStatus("generating")
    setError(null)

    try {
      const response = await fetch("/api/generate-scad", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ description }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.code) {
        throw new Error(data?.error || "Failed to generate OpenSCAD code.")
      }

      setStatus("ready")
      return data.code as string
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate OpenSCAD code."
      setError(message)
      setStatus("error")
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setStatus("idle")
    setError(null)
  }, [])

  return { status, error, generate, reset }
}
