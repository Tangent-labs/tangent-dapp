"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TokenImage } from "./token_image"
import { IconSingleArrow } from "@/components/icons/icon_single_arrow"
import { ExistingAsset } from "@/types"

type EvolutionBoxProps = {
  originalValue: string | number
  newValue?: string | number
  label?: string
  logo?: ExistingAsset
  className?: string
}

export function EvolutionBox({ label, originalValue, newValue, logo, className = "" }: EvolutionBoxProps) {
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
      {label && <div className="mb-1 text-sm text-subtitle">{label}</div>}

      <div
        className={`relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[10px] px-4 py-2 backdrop-blur-[60px] transition-all duration-500 ${flash ? "bg-white/20" : "bg-overlay-panel"} `}
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
          <span className="font-semibold">{originalValue}</span>
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
              <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 0.5, ease: "easeOut" }}>
                <IconSingleArrow className="h-3 w-3" />
              </motion.div>

              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-tonic">{newValue}</span>
                {logo && (
                  <div className="w-5">
                    <TokenImage size={48} token={logo} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
