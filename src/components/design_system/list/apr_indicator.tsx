import { IconHourGlass } from "@/components/icons/icon_hourglass"
import { ReactNode } from "react"
import USGHoverCard from "../structure/usg_hover_card"

interface ListAprIndicatorProps {
  children: ReactNode
  className?: string
}

export default function AprIndicator({ children, className = "" }: ListAprIndicatorProps) {
  return (
    <div className={`ml-1 flex items-center gap-1 text-white ${className}`}>
      <USGHoverCard title="">{children}</USGHoverCard>

      <IconHourGlass className="h-auto w-[20px] text-gray-400 text-row-tonic" />
    </div>
  )
}
