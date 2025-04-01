"use client"

import { LockData, LockPositionSelectTemplate } from "@/components/products/tg_usd/tg_usd_type"
import { ReactNode } from "react"
import { Button } from "./button"
import InputSelect from "./input_select"

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

  const handleRemovePosition = (index: number) => {
    const newPositions = selectedPositions.filter((_, i) => i !== index)

    setSelectedPositions(newPositions)
  }

  if (!lockData || allPositions.length === 0) {
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
          <button onClick={() => handleRemovePosition(index)} className="font-bold text-gray-400 hover:text-red-500" aria-label="Remove position">
            ✕
          </button>
        </div>
      ))}

      <div className="mt-2 flex h-[30px] gap-2">
        <Button onClick={handleAddPosition} className="text-md flex h-full w-[30px] items-center justify-center rounded-xl text-xl">
          +
        </Button>
        <button
          onClick={handleSelectAll}
          disabled={allPositions.length === 0}
          className="flex h-full items-center justify-center rounded-lg border border-gray-600 px-4 py-1 text-white"
        >
          Select all
        </button>
      </div>
    </div>
  )
}
