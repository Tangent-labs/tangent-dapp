import { UI_V2 } from "@/v2/ui"

type DividerProps = React.HTMLAttributes<HTMLHRElement>

export function Divider({ className, ...props }: DividerProps) {
  return <hr className={`${UI_V2 ? "my-3 h-px w-full border-0 bg-divider" : "my-2.5 h-0.5 w-full border-white/10"} ${className || ""}`} {...props} />
}
