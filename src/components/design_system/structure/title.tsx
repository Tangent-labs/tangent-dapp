import { cn } from "@/lib/utils"

type TitleProps = Partial<React.HTMLAttributes<HTMLSpanElement>> & {
  label: string
  size: "normal" | "big" | "small"
}

export default function Title({ label, size = "normal", className, ...props }: TitleProps) {
  const cssSizeClass = {
    small: "text-[20px]",
    normal: "text-[24px]",
    big: "text-5xl",
  }

  return (
    <span className={"font-bold " + cn(cssSizeClass[size], className)} {...props}>
      {label}
    </span>
  )
}
