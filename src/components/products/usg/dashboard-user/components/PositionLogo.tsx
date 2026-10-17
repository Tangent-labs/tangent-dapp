import { cn } from "@/lib/utils"
import { TokenImage } from "@/components/design_system/structure/token_image"

type PositionLogoProps = {
  token: string
  className?: string
}

// Logo of a position: a square as tall as the block next to it (name + reward tokens), so both are aligned.
// Default sizes = the height of that block (line of the name + 2px + reward tokens of 24px)
export const PositionLogo = ({ token, className }: PositionLogoProps) => (
  <TokenImage token={token} size={48} className={cn("size-[46px] shrink-0 object-contain md:size-[53px]", className)} />
)
