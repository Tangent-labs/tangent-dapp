import { IconStars } from "@/components/icons/icon_stars"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type APRDisplayProps = {
  apr: number
}

export const APRDisplay = ({ apr }: APRDisplayProps) => {
  return (
    <div className="flex items-center justify-start gap-[5px]">
      <div className="flex items-center justify-center gap-[5px] rounded-[10px] bg-overlay-panel p-[10px]">
        <TokenImage token="sUSG" size={20} />
        sUSG
      </div>

      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
          <button type="button" className="inline-flex items-center hover:text-[#95FF00]">
            <div className="mr-1 text-xl font-semibold">{apr.toFixed(2)}%</div>
            <IconStars className="fill-[#95FF00]" />
          </button>
        </HoverCardTrigger>

        <HoverCardContent side="top" align="center" className="z-1001 p-2 text-center text-xs">
          7 days trailing APY
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
