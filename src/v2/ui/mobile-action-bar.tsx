"use client"

import { RefObject, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

/**
 * Phones and tablets: on pages where the action card sits under the content, this bar keeps it one tap away.
 * It sits on top of the tab bar, scrolls to the card on tap, and hides itself while the card is on screen. Hidden from xl up.
 */
export function MobileActionBar({ target, title, sub, label }: { target: RefObject<HTMLElement | null>; title?: string; sub?: string; label: string }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = target.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [target])

  return (
    <AnimatePresence>
      {!visible && (
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.8, 0.25, 1] }}
          className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-40 border-t border-hairline bg-[rgba(15,15,15,0.96)] px-4 py-3 backdrop-blur-md lg:bottom-0 xl:hidden"
        >
          <div className="mx-auto flex max-w-[560px] items-center gap-3">
            <span className="min-w-0 flex-1">
              {title && <span className="block truncate text-[13px] font-semibold">{title}</span>}
              {sub && <span className="block truncate text-xs tabular-nums text-ink-3">{sub}</span>}
            </span>
            <button
              type="button"
              onClick={() => target.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="h-11 shrink-0 rounded-[10px] bg-action px-5 text-[14px] font-semibold text-white transition-colors hover:bg-action-hover"
            >
              {label}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
