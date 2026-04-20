"use client"

import { ButtonTab } from "./button_tab"
import { useEffect, useRef, useState } from "react"
import { IconGearWheel } from "@/components/icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type SlippageInputProps = {
  slippage: number
  setSlippage: (n: number) => void
}

export const SlippageInput = ({ slippage, setSlippage }: SlippageInputProps) => {
  const [localValue, setLocalValue] = useState(slippage.toString())

  const [isHovered, setIsHovered] = useState(false)

  const [open, setOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setLocalValue(slippage.toString())
  }, [slippage])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replaceAll(",", ".").trim()
    if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
      const num = parseFloat(val)
      if (val !== "" && num > 100) return
      setLocalValue(val)
      if (val === "") {
        setSlippage(0)
      } else if (!isNaN(num) && num >= 0) {
        setSlippage(num)
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button title="Slippage" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onPointerDown={(e) => e.stopPropagation()}>
          <IconGearWheel className="mb-1 h-auto w-4 text-row-tonic" isHovered={isHovered} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          inputRef.current?.focus()
        }}
        side="bottom"
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="!m-0 !w-44 border-none font-gilroy"
      >
        <div className="flex w-full flex-col gap-2 p-[10px]">
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-subtitle">Slippage</span>
            <button onClick={() => setOpen(false)} className="text-xs text-subtitle hover:text-white">
              ✕
            </button>
          </div>

          <div className="w-full rounded-[10px] border border-white/10">
            <div className="flex h-[30px] w-full items-center justify-between rounded-[9px] bg-select-input px-[10px]">
              <input
                onChange={handleChange}
                value={localValue}
                placeholder="0"
                type="text"
                inputMode="decimal"
                min={0.1}
                step={0.1}
                className="w-full bg-transparent text-xs text-white focus:outline-none"
                ref={inputRef}
              />
              <span className="text-xs text-subtitle">%</span>
            </div>
          </div>

          <div className="flex w-full items-center gap-2">
            <ButtonTab onClick={() => setSlippage(0.5)} label={"0.5%"} active={slippage === 0.5} className="flex-1 rounded-full !px-2 !py-1" />
            <ButtonTab onClick={() => setSlippage(1)} label={"1.0%"} active={slippage === 1} className="flex-1 rounded-full !px-2 !py-1" />
            <ButtonTab onClick={() => setSlippage(2)} label={"2.0%"} active={slippage === 2} className="flex-1 rounded-full !px-2 !py-1" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
