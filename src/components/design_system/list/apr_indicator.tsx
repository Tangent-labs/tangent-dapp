import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { IconStars } from "@/components/icons/icon_stars"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface AprIndicatorProps {
  children: ReactNode[]
  isMax: boolean
  className?: string
}

export function AprIndicator({ children, isMax, className = "" }: AprIndicatorProps) {
  return (
    <div
      /* prettier-ignore */
      className={`
        flex items-center gap-1 
        text-white 
        transition duration-200
       ${isMax ? "hover:text-row-success" : "hover:text-row-tonic"} ${className}`}
    >
      <HoverCard openDelay={150} closeDelay={100}>
        <HoverCardTrigger asChild>
          <span className="flex cursor-pointer items-center justify-center gap-1 text-sm xl:text-[15px]">
            {children[0]}
            <IconStars className={cn(isMax ? "fill-row-success" : "fill-row-tonic", "w-4")}></IconStars>
          </span>
        </HoverCardTrigger>
        <HoverCardContent side="top" align="center" className="z-[9999] w-full border border-white/10 text-xs">
          {children[1]}
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
