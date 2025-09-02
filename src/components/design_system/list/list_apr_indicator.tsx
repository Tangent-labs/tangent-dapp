import { IconHourGlass } from "@/components/icons/icon_hourglass"
import USGHoverCard from "../structure/usg_hover_card"

interface ListAprIndicatorProps {
  helpMessage?: string
  className?: string
}

export default function ListAprIndicator({ helpMessage, className = "" }: ListAprIndicatorProps) {
  return (
    <div className={`ml-1 flex items-center gap-1 text-white ${className}`}>
      <USGHoverCard title="">{helpMessage}</USGHoverCard>

      <IconHourGlass className="h-auto w-[20px] text-gray-400 text-row-tonic" />
    </div>
  )
}
