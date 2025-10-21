"use client"

import { useState } from "react"
import { Button } from "../inputs/button"
import { ChevronDown } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

export const FeatureSelect = ({ value, onChange, options }: { value: string; onChange: (f: string) => void; options: Array<string> }) => {
  const [open, setOpen] = useState(false)

  const label = options.find((option) => option.toLowerCase() === value.toLowerCase()) ?? options[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="relative w-full justify-center rounded-[10px] bg-white text-black">
          <span className="text-sm font-semibold">{label}</span>
          <ChevronDown className="absolute right-4 h-5 w-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="rounded-[10px] p-1 font-gilroy">
        <div className="flex flex-col gap-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
              className="w-full rounded-[10px] px-3 py-1 text-left font-gilroy"
            >
              {opt}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
