"use client"

import React from "react"
import PanelRaw from "./panel_raw"

type EvolutionBoxrops = React.ButtonHTMLAttributes<HTMLDivElement> & {
  label: string
  originalValue: string
  newValue?: string
}

export default function EvolutionBox({ label, originalValue, newValue, ...props }: EvolutionBoxrops) {
  return (
    <div {...props}>
      <div className="text-sm text-gray-400"> {label} </div>
      <PanelRaw className="flex items-center justify-between gap-2 px-4 py-2">
        <div className="text-lg font-bold">{originalValue}</div>

        <div>
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9.67415 4.35355C9.86941 4.15829 9.86941 3.84171 9.67415 3.64645L6.49217 0.464466C6.29691 0.269204 5.98032 0.269204 5.78506 0.464466C5.5898 0.659728 5.5898 0.976311 5.78506 1.17157L8.61349 4L5.78506 6.82843C5.5898 7.02369 5.5898 7.34027 5.78506 7.53553C5.98032 7.7308 6.29691 7.7308 6.49217 7.53553L9.67415 4.35355ZM0.473267 4.5H9.32059V3.5H0.473267V4.5Z"
              fill="#9B9B9B"
            />
          </svg>
        </div>
        {newValue ? <div className="text-lg font-bold text-tonic">{newValue}</div> : <div className="w-10 text-center">-</div>}
      </PanelRaw>
    </div>
  )
}
