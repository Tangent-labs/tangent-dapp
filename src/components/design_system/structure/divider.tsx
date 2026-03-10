type DividerProps = React.HTMLAttributes<HTMLHRElement>

export function Divider({ className, ...props }: DividerProps) {
  return <hr className={`my-2 h-0.5 w-full border-white/10 ${className || ""}`} {...props} />
}
