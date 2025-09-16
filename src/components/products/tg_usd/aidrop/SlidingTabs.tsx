"use client"

type SlidingTabsProps = {
  labels: ("Borrow & LP" | "Vote")[]
  value: "Borrow & LP" | "Vote"
  onChange: (index: "Borrow & LP" | "Vote") => void
}

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export function SlidingTabs({ labels, value, onChange }: SlidingTabsProps) {
  return (
    <div className="relative w-full">
      <div aria-hidden className={cx("pointer-events-none absolute bottom-0 left-0 h-px w-full bg-slate-700/60", "dark:bg-slate-600/40")} />

      <div
        aria-hidden
        className={cx(
          "pointer-events-none absolute bottom-0 left-0 h-1 w-1/2 rounded-full",
          "bg-gradient-to-r from-sky-400 to-blue-600",
          "shadow-[0_0_12px_1px_rgba(37,99,235,0.35)]",
          "transition-transform duration-300 ease-out motion-reduce:transition-none"
        )}
        style={{ transform: `translateX(${value === "Borrow & LP" ? "0%" : "100%"})` }}
      />

      <div className="relative z-10 flex w-full">
        {labels?.map((label) => {
          return (
            <button
              key={label}
              role="tab"
              className={cx(
                "w-1/2 select-none px-4 py-3 text-center font-medium outline-none",
                "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                "dark:focus-visible:ring-offset-slate-900",
                label === value ? "text-slate-900 dark:text-slate-50" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
              onClick={() => onChange(label)}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
