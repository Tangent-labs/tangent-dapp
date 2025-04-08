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
        "data-[state=active]text-black inline-flex items-center justify-center whitespace-nowrap rounded-[10px] border border-gray-400 px-4 py-2 text-sm font-bold hover:bg-white hover:bg-opacity-[3%] disabled:cursor-not-allowed disabled:bg-gray-400 data-[state=active]:bg-white data-[state=active]:text-black"
      )}
      {...props}
    >
      {label}
    </button>
  )
}
