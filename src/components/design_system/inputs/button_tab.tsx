import clsx from "clsx"
import { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"
import { UI_V2 } from "@/v2/ui"

type ButtonTabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  active: boolean
}

export function ButtonTab({ label, active, className, ...props }: ButtonTabProps) {
  if (UI_V2)
    return (
      <button
        type="button"
        role="tab"
        aria-selected={active}
        data-state={active ? "active" : "inactive"}
        className={cn(
          className,
          "inline-flex h-7 items-center justify-center whitespace-nowrap rounded-md border-0 !py-0 px-2.5 text-xs font-medium tabular-nums transition-colors duration-150 disabled:cursor-not-allowed",
          active ? "bg-white/[0.09] text-white" : "text-ink-3 hover:text-ink-2"
        )}
        {...props}
      >
        {label}
      </button>
    )

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      data-state={active ? "active" : "inactive"}
      id="radix-:r0:-trigger-deposit"
      className={clsx(
        className,
        "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] border-tangent border-gray-400 px-4 py-1 text-xs font-semibold transition-colors duration-200 ease-in-out disabled:cursor-not-allowed data-[state=active]:border-white data-[state=inactive]:border-opacity-10 data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-subtitle data-[state=inactive]:hover:bg-white/10 data-[state=inactive]:hover:text-white"
      )}
      {...props}
    >
      {label}
    </button>
  )
}
