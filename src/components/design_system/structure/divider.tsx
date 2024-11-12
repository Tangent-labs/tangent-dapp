type DividerProps = React.HTMLAttributes<HTMLHRElement>

export default function Divider({ className, ...props }: DividerProps) {
  return <hr className={`my-4 border-gray-600 ${className || ""}`} {...props} />
}
