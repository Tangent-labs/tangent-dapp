import { cn } from "@/lib/utils"

type TitleProps = Partial<React.HTMLAttributes<HTMLSpanElement>> & {
  label: string
  size: "normal" | "big"
}

export default function Title({ label, size = "normal", className, ...props }: TitleProps) {
  const cssSizeClass = {
    normal: "text-3xl",
    big: "text-5xl",
  }

  return (
    <span className={cn(cssSizeClass[size], className)} {...props}>
      {label}
    </span>
  )
}
