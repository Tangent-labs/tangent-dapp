import clsx from "clsx"
import { ButtonHTMLAttributes } from "react"

type ButtonTabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  active: boolean
}

export default function ButtonTab({ label, active, className, ...props }: ButtonTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      id="radix-:r0:-trigger-deposit"
      className={clsx(
        className,
        "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] border border-gray-400 px-4 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:bg-gray-400 data-[state=inactive]:border-opacity-30 data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-subtitle data-[state=inactive]:hover:bg-white/10 data-[state=inactive]:hover:text-white"
      )}
      {...props}
    >
      {label}
    </button>
  )
}
