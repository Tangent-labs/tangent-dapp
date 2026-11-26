import { cn } from "@/lib/utils"
import { UI_V2 } from "@/v2/ui"

type TitleProps = Partial<React.HTMLAttributes<HTMLSpanElement>> & {
  label: string
  size: "normal" | "big" | "small"
}

export function Title({ label, size = "normal", className, ...props }: TitleProps) {
  const cssSizeClass = {
    small: "text-xl",
    normal: UI_V2 ? "text-[17px] tracking-[-0.01em]" : "text-[24px]",
    big: "text-5xl",
  }

  return (
    <span className={cn(cssSizeClass[size], className, "font-semibold")} {...props}>
      {label}
    </span>
  )
}
