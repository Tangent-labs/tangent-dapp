"use client"

import React, { ReactNode } from "react"
import { ExistingAsset } from "@/types"
import TokenImage from "./token_image"
import { IconSingleArrow } from "@/components/icons/icon_single_arrow"

type EvolutionBoxProps = React.ButtonHTMLAttributes<HTMLDivElement> & {
  originalValue: string | ReactNode
  label?: string
  newValue?: string | ReactNode
  logo?: ExistingAsset
}

export default function EvolutionBox({ label, originalValue, newValue, logo, ...props }: EvolutionBoxProps) {
  return (
    <div {...props}>
      <div className="text-sm text-subtitle"> {label} </div>
      <div className="flex items-center justify-between gap-2 rounded-[10px] bg-overlay-panel px-4 py-1.5 text-[16px] backdrop-blur-[60px]">
        {originalValue == newValue ? (
          <>
            <div className="flex w-full items-center justify-center gap-1">
              <div className="font-semibold">{originalValue} </div>
              {logo && (
                <div className="w-5">
                  <TokenImage size={48} token={logo} />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <div className="font-semibold">{originalValue} </div>
              {logo && (
                <div className="w-5">
                  <TokenImage size={48} token={logo} />
                </div>
              )}
            </div>

            <IconSingleArrow></IconSingleArrow>

            {newValue ? (
              <div className="flex items-center gap-1">
                <div className="font-semibold text-tonic">{newValue}</div>
                {logo && (
                  <div className="w-5">
                    {" "}
                    <TokenImage size={48} token={logo} />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-10 text-center">-</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
