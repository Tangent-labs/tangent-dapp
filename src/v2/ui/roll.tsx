"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

const EASE = [0.25, 0.8, 0.25, 1] as const

/**
 * Rolls the characters of an already formatted value when it changes ("$1,234.56", "83.58%", "1.02").
 * Only the characters that differ move: the old one leaves upward, the new one comes up from below.
 * Presentation only, the value is passed as the live components format it. No motion with prefers-reduced-motion.
 */
export function Roll({ value, className }: { value: string | number | undefined | null; className?: string }) {
  const reduce = useReducedMotion()
  const text = value === undefined || value === null ? "-" : String(value)
  if (reduce) return <span className={cn("tabular-nums", className)}>{text}</span>

  // key each character by its position from the right, so "9.99" -> "10.00" keeps the decimals aligned
  const chars = text.split("")
  return (
    <span className={cn("relative inline-flex overflow-hidden tabular-nums", className)}>
      <span className="sr-only">{text}</span>
      {chars.map((ch, i) => {
        const fromRight = chars.length - i
        return (
          <span key={fromRight} aria-hidden className="relative inline-block">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={ch}
                className="inline-block whitespace-pre"
                initial={{ y: "70%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-70%", opacity: 0 }}
                transition={{ duration: 0.22, ease: EASE }}
              >
                {ch}
              </motion.span>
            </AnimatePresence>
          </span>
        )
      })}
    </span>
  )
}

/** Crossfade from a loading placeholder to the first real value (skeleton to data, 150 ms). */
export function FadeIn({ show, children, className }: { show: boolean; children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  if (!show) return null
  return (
    <motion.span className={className} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
      {children}
    </motion.span>
  )
}
