import { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * V2 status chip: hairline ring, quiet fill, an icon that carries the meaning. Color only on the glyph when it matters
 * (amber for paused, blue for a live preview), never a tinted pill. Muted for an off state.
 */
export function StatusChip({ icon, children, muted, className }: { icon?: ReactNode; children: ReactNode; muted?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 whitespace-nowrap rounded-[6px] px-1.5 text-[11px] font-medium leading-none ring-1 ring-inset ring-hairline [&_svg]:h-3 [&_svg]:w-3 [&_svg]:shrink-0",
        muted ? "text-ink-3" : "bg-white/[0.05] text-ink-2",
        className
      )}
    >
      {icon}
      {children}
    </span>
  )
}
