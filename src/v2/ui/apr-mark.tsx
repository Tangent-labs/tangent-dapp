import { IconStars } from "@/components/icons/icon_stars"
import { cn } from "@/lib/utils"

/** The live AprIndicator mark (IconStars) next to a vAPR, in the V2 blue: tells there is a breakdown on hover. */
export function AprMark({ className }: { className?: string }) {
  return <IconStars className={cn("h-3 w-3 shrink-0 fill-action transition-transform duration-200 group-hover/apr:scale-110", className)} />
}
