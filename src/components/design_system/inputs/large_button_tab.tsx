import clsx from "clsx"
import { ButtonHTMLAttributes } from "react"

type ButtonTabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  active: boolean
}

export default function LargeButtonTab({ label, active, className, ...props }: ButtonTabProps) {
  return (
    <div className="group relative inline w-full">
      <button
        type="button"
        role="tab"
        aria-selected={active}
        data-state={active ? "active" : "inactive"}
        id="radix-:r0:-trigger-deposit"
        className={clsx(
          className,
          "relative inline-flex items-center justify-center whitespace-nowrap rounded-[10px] px-4 py-1 text-sm font-semibold backdrop-blur-[60px] transition-all duration-200 ease-in-out disabled:cursor-not-allowed",
          "data-[state=active]:bg-white data-[state=active]:text-black",
          "data-[state=inactive]:bg-white/[0.03] data-[state=inactive]:text-subtitle"
        )}
        {...props}
      >
        {label}
      </button>

      {/* Gradient border effect - only visible when inactive */}
      {!active && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[10px]"
          style={{
            border: "1px solid transparent",
            background: "linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%, rgba(255, 255, 255, 0.1) 100%) border-box",
            WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}

      {/* Hover overlay - same as trigger: bg-white/[0.02] */}
      {!active && <div className="pointer-events-none absolute inset-0 rounded-[10px] bg-white/0 transition-all duration-200 group-hover:bg-white/[0.04]" />}
    </div>
  )
}
