"use client"
import { IconCircleHelp, IconHourGlass } from "@/components/icons"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import Panel from "@/components/design_system/structure/panel"

interface ListHarvestIndicatorProps {
  isHarvested: boolean
  helpMessage?: string
  className?: string
}

export default function ListHarvestIndicator({ isHarvested, helpMessage, className = "" }: ListHarvestIndicatorProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Popover>
        <PopoverTrigger asChild>
          <button aria-label="Help" type="button">
            <IconCircleHelp className="h-auto w-[20px] text-row-tonic" />
            <span className="sr-only"> Info on harvest </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="border-none p-3">
          <Panel>{helpMessage || "No help available"}</Panel>
        </PopoverContent>
      </Popover>

      <IconHourGlass className={`h-auto w-[20px] ${isHarvested ? "text-row-tonic" : "text-subtitle"}`} />
    </div>
  )
}
