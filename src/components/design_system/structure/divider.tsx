type DividerProps = React.HTMLAttributes<HTMLHRElement>

export function Divider({ className, ...props }: DividerProps) {
  return <hr className={`my-2 border-gray-600 ${className || ""}`} {...props} />
}
