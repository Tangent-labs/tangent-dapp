"use client"

import { ButtonTab } from "./button_tab"
import { useEffect, useState } from "react"
import { IconGearWheel } from "@/components/icons"
import { ReliefCard } from "../structure/relief_card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type SlippageInputProps = {
  slippage: number
  setSlippage: (n: number) => void
}

export const SlippageInput = ({ slippage, setSlippage }: SlippageInputProps) => {
  const [localValue, setLocalValue] = useState(slippage.toString())

  useEffect(() => {
    if (document.activeElement?.tagName === "INPUT") return
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
    <Popover>
      <PopoverTrigger asChild>
        <ReliefCard className="flex w-[88px] cursor-pointer items-center justify-between font-gilroy">
          <span className="px-2 text-xs text-subtitle"> {slippage}%</span>
          <button type="button" title="Slippage">
            <div className="cursor-pointer rounded-[10px] bg-button-gradient px-2.5 py-2 hover:bg-white/10">
              <IconGearWheel className="h-auto w-3 text-row-tonic" />
            </div>
          </button>
        </ReliefCard>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="center" sideOffset={8} collisionPadding={16} className="!m-0 !w-56 border-none font-gilroy">
        <ReliefCard className="p-3">
          <div className="flex w-full flex-col items-center justify-between gap-2">
            <div className="flex w-full items-center justify-start">Slippage</div>
            <input
              onChange={handleChange}
              value={localValue}
              placeholder="0"
              type="text"
              inputMode="decimal"
              min={0.1}
              step={0.1}
              className="w-full rounded-[10px] border border-white/30 bg-transparent pl-2 focus:outline-none"
            />
            <div className="mt-2 flex w-full items-center justify-between gap-2">
              <ButtonTab onClick={() => setSlippage(0.5)} label={"0.5%"} active={slippage === 0.5} className="rounded-full !px-2 !py-1" />
              <ButtonTab onClick={() => setSlippage(1)} label={"1.0%"} active={slippage === 1} className="rounded-full !px-2 !py-1" />
              <ButtonTab onClick={() => setSlippage(2)} label={"2.0%"} active={slippage === 2} className="rounded-full !px-2 !py-1" />
            </div>
          </div>
        </ReliefCard>
      </PopoverContent>
    </Popover>
  )
}
