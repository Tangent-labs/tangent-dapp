import { ReactNode } from "react"
import USGHoverCard from "../structure/usg_hover_card"

interface ListAprIndicatorProps {
  children: ReactNode
  className?: string
}

export default function AprIndicator({ children, className = "" }: ListAprIndicatorProps) {
  return (
    <div className={`ml-1 flex items-center gap-1 text-white ${className}`}>
      <USGHoverCard iconClassName="h-auto w-[14px] text-row-tonic" title="">
        {children}
      </USGHoverCard>
    </div>
  )
}
