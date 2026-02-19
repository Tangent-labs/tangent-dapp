import { cn } from "@/lib/utils"

type ListGradientBorderProps = {
  classname?: string
}

export const ListGradientBorder = ({ classname }: ListGradientBorderProps) => {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", classname)}
      style={{
        border: "1px solid transparent",
        background: "linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%, rgba(255, 255, 255, 0.1) 100%) border-box",
        WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    />
  )
}
