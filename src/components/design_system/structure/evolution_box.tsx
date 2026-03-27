"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TokenImage } from "./token_image"
import { IconSingleArrow } from "@/components/icons/icon_single_arrow"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type EvolutionBoxProps = {
  originalValue: string | number
  newValue?: string | number
  label?: string
  logo?: string
  className?: string
  displayHover?: boolean
  hoverContent?: string
}

export function EvolutionBox({ label, originalValue, newValue, logo, displayHover = false, hoverContent, className = "" }: EvolutionBoxProps) {
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

        <div className="flex items-center gap-2 text-sm">
          {displayHover ? (
            <>
              <HoverCard openDelay={150} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <span className="cursor-pointer font-semibold">{originalValue}</span>
                </HoverCardTrigger>
                <HoverCardContent side="top" align="center" className="z-[9999] flex w-full justify-center px-2 py-1 text-xs text-subtitle">
                  {hoverContent}
                </HoverCardContent>
              </HoverCard>
            </>
          ) : (
            <span className="font-semibold">{originalValue}</span>
          )}

          {logo && (
            <div className="w-5">
              <TokenImage size={48} token={logo} />
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
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

        <AnimatePresence mode="wait">
          {hasChanged && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.35, type: "spring", stiffness: 400, damping: 28 }}
              className="flex items-center gap-2 text-sm"
            >
              <span className="font-semibold text-tonic">{newValue}</span>
              {logo && (
                <div className="w-5">
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
