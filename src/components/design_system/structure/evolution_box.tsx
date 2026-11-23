"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TokenImage } from "./token_image"
import { IconSingleArrow } from "@/components/icons/icon_single_arrow"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type EvolutionBoxProps = {
  originalValue: ReactNode
  newValue?: ReactNode
  label?: string
  logo?: string
  className?: string
  displayHover?: boolean
  hoverContent?: string
  originalColor?: string
  newValueColor?: string
}

export function EvolutionBox({
  label,
  originalValue,
  newValue,
  logo,
  displayHover = false,
  hoverContent,
  className = "",
  originalColor,
  newValueColor,
}: EvolutionBoxProps) {
  const hasChanged = useMemo(() => {
    return newValue !== undefined && newValue !== originalValue
  }, [newValue, originalValue])

  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (hasChanged) {
      setFlash(true)
      const timer = setTimeout(() => setFlash(false), 400)
      return () => clearTimeout(timer)
    }
  }, [newValue, hasChanged])

  return (
    <div className={className}>
      {label && <div className="mb-1 text-[15px] text-subtitle">{label}</div>}

      <div
        className={`relative flex w-full items-center gap-2 overflow-hidden rounded-[10px] px-4 py-2 transition-all duration-500 ${hasChanged ? "justify-between" : "justify-center"} ${flash ? "bg-white/20" : "bg-overlay-panel"} `}
      >
        {flash && (
          <motion.div
            className="pointer-events-none absolute inset-0 bg-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* layout : justify-content can't transition, so framer glides the value between centered and left.
            Only on that switch (layoutDependency), and position only : a plain value swap (date -> infinity) must not slide or stretch.
            h-4 : the global `line-height: normal !important` makes a text line ~17px but an icon 16px, so the box height jumped on swap */}
        <motion.div
          layout="position"
          layoutDependency={hasChanged}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="flex h-4 items-center gap-2 text-sm"
        >
          {displayHover ? (
            <>
              <HoverCard openDelay={50} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <span className="cursor-pointer font-semibold" style={{ color: originalColor }}>
                    {originalValue}
                  </span>
                </HoverCardTrigger>
                <HoverCardContent side="top" align="center" className="z-[9999] flex w-full justify-center px-2 py-1 text-xs text-subtitle">
                  {hoverContent}
                </HoverCardContent>
              </HoverCard>
            </>
          ) : (
            <span className="font-semibold" style={{ color: originalColor }}>
              {originalValue}
            </span>
          )}

          {logo && (
            <div className="w-4">
              <TokenImage size={48} token={logo} />
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="popLayout">
          {hasChanged && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.35, type: "spring", stiffness: 500, damping: 30 }}
              className="flex items-center gap-3"
            >
              <IconSingleArrow className="h-3 w-3" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {hasChanged && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.35, type: "spring", stiffness: 400, damping: 28 }}
              className="flex h-4 items-center gap-2 text-sm"
            >
              <span className="font-semibold" style={{ color: newValueColor ?? "var(--tgt-tonic)" }}>
                {newValue}
              </span>
              {logo && (
                <div className="w-4">
                  <TokenImage size={48} token={logo} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
