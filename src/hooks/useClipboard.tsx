"use client"

import { useCallback, useState } from "react"

export function useClipboard(timeout = 1500) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text)
        } else {
          const ta = document.createElement("textarea")
          ta.value = text
          ta.style.position = "fixed"
          ta.style.opacity = "0"
          ta.style.pointerEvents = "none"
          document.body.appendChild(ta)
          ta.select()
          const ok = document.execCommand("copy")
          document.body.removeChild(ta)
          if (!ok) throw new Error("execCommand failed")
        }
        setCopied(true)
        window.setTimeout(() => setCopied(false), timeout)
        return true
      } catch (e) {
        console.error("Copy failed:", e)
        setCopied(false)
        return false
      }
    },
    [timeout]
  )

  return { copied, copy }
}
