import { IconHourGlass } from "@/components/icons/icon_hourglass"
import TgHoverCard from "../structure/tg_hover_card"
import { ReactNode } from "react"

interface ListAprIndicatorProps {
  children: ReactNode
  className?: string
}

export default function AprIndicator({ children, className = "" }: ListAprIndicatorProps) {
  return (
    <div className={`ml-1 flex items-center gap-1 text-white ${className}`}>
      <TgHoverCard title="">{children}</TgHoverCard>

      <IconHourGlass className="h-auto w-[20px] text-gray-400 text-row-tonic" />
    </div>
  )
}
