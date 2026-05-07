import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { IconStars } from "@/components/icons/icon_stars"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface AprIndicatorProps {
  children: ReactNode[]
  isMax: boolean
  className?: string
}

export function AprIndicator({ children, isMax, className = "" }: AprIndicatorProps) {
  const trigger = (
    <>
      {children[0]}
      <IconStars className={cn(isMax ? "fill-row-success" : "fill-row-tonic", "w-4")} />
    </>
  )

  return (
    <div className={`flex items-center gap-1 text-white transition duration-200 ${isMax ? "hover:text-row-success" : "hover:text-row-tonic"} ${className}`}>
      {/* Desktop: hover */}
      <HoverCard openDelay={150} closeDelay={100}>
        <HoverCardTrigger asChild>
          <span className="hidden cursor-pointer appearance-none items-center justify-center gap-1 text-sm xl:flex xl:text-[15px]">{trigger}</span>
        </HoverCardTrigger>
        <HoverCardContent side="top" align="center" className="z-[9999] w-full text-xs">
          {children[1]}
        </HoverCardContent>
      </HoverCard>

      {/* Mobile: tap */}
      <div className="stop-navigation xl:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <span className="no-parent-hover flex cursor-pointer appearance-none items-center justify-center gap-1 text-sm">{trigger}</span>
          </PopoverTrigger>
          <PopoverContent side="top" align="center" className="z-[9999] w-full text-xs">
            {children[1]}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
