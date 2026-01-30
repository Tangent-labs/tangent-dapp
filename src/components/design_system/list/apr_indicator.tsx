import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { IconStars } from "@/components/icons/icon_stars"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface AprIndicatorProps {
  children: ReactNode[]
  isMax: boolean
  className?: string
}

export default function AprIndicator({ children, isMax, className = "" }: AprIndicatorProps) {
  return (
    <div className={`flex items-center gap-1 text-white ${className}`}>
      <HoverCard>
        <HoverCardTrigger asChild>
          <button className="flex items-center justify-center gap-1 text-sm xl:text-lg" type="button">
            {children[0]}
            <IconStars className={cn(isMax ? "fill-[#95FF00]" : "fill-row-tonic", "w-4")}></IconStars>
          </button>
        </HoverCardTrigger>
        <HoverCardContent side="top" align="center" className="z-[9999] w-fit max-w-56 border border-white/10 text-xs">
          <div className="grid gap-4 !border-none">
            <div className="space-y-2">{children[1]}</div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
