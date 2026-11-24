"use client"

import { ReactNode, useEffect, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useDragControls } from "framer-motion"
import { cn } from "@/lib/utils"

/** The width from which the action card sits in the page (the xl two-column layout). Below it, it opens in a sheet. */
const DESKTOP = "(min-width: 1280px)"
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP)
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}
/** True from xl up. The server renders the desktop layout; phones switch right after hydration (the inline card is CSS-hidden meanwhile). */
export const useIsDesktop = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP).matches,
    () => true
  )

const PHONE = "(max-width: 767px)"
const subscribePhone = (cb: () => void) => {
  const mq = window.matchMedia(PHONE)
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}
/** True on phones (under md). Server renders the desktop behavior. */
export const useIsMobile = () =>
  useSyncExternalStore(
    subscribePhone,
    () => window.matchMedia(PHONE).matches,
    () => false
  )

type BarAction = { label: string; onClick: () => void; primary?: boolean }

/**
 * Phones and tablets, like a mobile banking or DeFi app (Aave): the action lives in a bar above the tab bar,
 * and opens the form in a bottom sheet instead of sending people to the bottom of the page. Hidden from xl up.
 */
export function MobileActionBar({ title, sub, actions }: { title?: string; sub?: string; actions: BarAction[] }) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-40 border-t border-hairline bg-[rgba(15,15,15,0.96)] px-4 py-3 backdrop-blur-md lg:bottom-0 xl:hidden">
      <div className="mx-auto flex max-w-[560px] items-center gap-2">
        <span className="min-w-0 flex-1">
          {title && <span className="block truncate text-[13px] font-semibold">{title}</span>}
          {sub && <span className="block truncate text-xs tabular-nums text-ink-3">{sub}</span>}
        </span>
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            className={cn(
              "h-11 shrink-0 rounded-[10px] px-4 text-[14px] font-semibold transition-colors",
              a.primary ? "bg-action text-white hover:bg-action-hover" : "bg-white/[0.07] text-white hover:bg-white/10"
            )}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Bottom sheet for the action form. Drag the handle down, tap outside or press Escape to close.
 * Only the handle starts a drag, so sliders and inputs inside the form keep working.
 * Sits under the token dialogs (z-50) so they still open on top of it.
 */
export function ActionSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode }) {
  const drag = useDragControls()
  // portal to body: a sheet opened from inside another sheet or a transformed card still covers the screen
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("[role=dialog][data-state=open]")) onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!mounted) return null
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-[48] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", visualDuration: 0.34, bounce: 0.06 }}
            drag="y"
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 500) onClose()
            }}
            className="fixed inset-x-0 bottom-0 z-[48] mx-auto flex max-h-[92dvh] max-w-[560px] flex-col rounded-t-[20px] border-t border-hairline bg-surface font-sans text-white"
          >
            <div onPointerDown={(e) => drag.start(e)} className="flex shrink-0 cursor-grab touch-none flex-col items-center px-4 pb-1 pt-3">
              <span className="h-1 w-10 rounded-full bg-white/20" />
              {title && <div className="mt-3 w-full text-[15px] font-semibold">{title}</div>}
            </div>
            <div className="overflow-y-auto overscroll-contain px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
