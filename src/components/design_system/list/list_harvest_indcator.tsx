"use client"
import { IconCircleHelp } from "@/components/icons/icon_circle_help"
import { IconHourGlass } from "@/components/icons/icon_hourglass"
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
      {/* Popover for IconCircleHelp */}
      <Popover>
        <PopoverTrigger asChild>
          <button aria-label="Help" type="button">
            <IconCircleHelp className="w-[20px] h-auto text-row-tonic" />
            <span className="sr-only"> Info on harvest </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="border-none  p-3">
          <Panel>{helpMessage || "No help available"}</Panel>
        </PopoverContent>
      </Popover>

      {/* IconHourGlass */}
      <IconHourGlass className={`w-[20px] h-auto ${isHarvested ? "text-row-tonic" : "text-gray-400"}`} />
    </div>
  )
}
