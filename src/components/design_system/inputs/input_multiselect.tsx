"use client"

import { LockData, LockPositionSelectTemplate } from "@/components/products/usg/usg_type"
import { ReactNode } from "react"
import { Button, BUTTON_SIZES } from "./button"
import { InputSelect } from "./input_select"
import { BorderPanel } from "../structure/border_panel"

interface MultiPositionSelectProps {
  lockData?: LockData
  selectedPositions: string[]
  setSelectedPositions: (arg: string[]) => void
  template?: (option: LockPositionSelectTemplate) => ReactNode
}

export const MultiPositionSelect = ({ lockData, selectedPositions, setSelectedPositions, template }: MultiPositionSelectProps) => {
  const allPositions = lockData?.positions || []
  const selectOptions = allPositions.map((el) => ({
    ...el,
    value: el.tokenId.toString(),
    label: el.tokenId.toString(),
  }))

  const handleAddPosition = () => {
    setSelectedPositions([...selectedPositions, ""])
  }

  const handleSelectAll = () => {
    const allTokenIds = allPositions.map((pos) => pos.tokenId.toString())
    setSelectedPositions(allTokenIds)
  }

  const handlePositionChange = (index: number, value: string) => {
    const newPositions = [...selectedPositions]
    newPositions[index] = value

    setSelectedPositions(newPositions)
  }

  const allSelected = allPositions.length > 0 && allPositions.length === selectedPositions?.length

  const handleRemovePosition = (index: number) => {
    const newPositions = selectedPositions.filter((_, i) => i !== index)

    setSelectedPositions(newPositions)
  }

  if (!lockData) {
    return (
      <div className="flex flex-col gap-2">
        <InputSelect disabled={true} className="shimmer w-full min-w-32 text-white" template={template} value="" options={[]} onChange={() => {}} />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {selectedPositions.map((position, index) => (
        <div key={index} className="flex w-full items-center gap-2">
          <div className="relative w-full">
            <InputSelect
              className="w-full min-w-32"
              template={template}
              value={position}
              options={selectOptions}
              onChange={(value) => handlePositionChange(index, value)}
            />
          </div>
          <BorderPanel
            onClick={() => handleRemovePosition(index)}
            className="flex h-3 w-3 cursor-pointer items-center justify-center !rounded-full p-3 text-xs font-semibold text-subtitle hover:border-white hover:text-white"
            aria-label="Remove position"
          >
            ✕
          </BorderPanel>
        </div>
      ))}

      {!allSelected && (
        <div className="mt-2 flex items-center justify-start gap-2">
          <Button size="sm" onClick={handleAddPosition} className="max-w-10" classNameChild="text-lg" aria-label="Add position">
            +
          </Button>

          {/* Same height token as the button beside it, so the two can never drift apart */}
          <button
            onClick={handleSelectAll}
            disabled={allPositions.length === 0}
            className={`${BUTTON_SIZES.sm.wrapper} flex cursor-pointer items-center justify-center rounded-[10px] border border-gray-600 px-4 text-xs font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed`}
          >
            Select all
          </button>
        </div>
      )}
    </div>
  )
}
