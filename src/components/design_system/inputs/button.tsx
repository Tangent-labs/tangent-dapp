"use client"

import { cn } from "@/lib/utils"

type ButtonProps = {
  className?: string
  label: string
  state?: "active" | "inactive" | "disabled"
  onClick?: () => void
}

export function Button({ label, state = "active", className, onClick }: ButtonProps) {
  let stateCss = state === "disabled" ? "text-black bg-button-active opacity-50" : ""
  stateCss += state === "active" ? "bg-button-active text-black" : ""
  stateCss += state === "inactive" ? " cursor-not-allowed" : ""

  return (
    <button
      onClick={onClick}
      disabled={state === "disabled"}
      className={cn(
        className,
        "disabled:cursor-not-allowed flex items-center border hover:bg-white hover:bg-opacity-[3%] border-white border-opacity-50 rounded-[10px]",
        stateCss
      )}
    >
      <span className="text-xs font-semibold p-2 px-4">{label}</span>
    </button>
  )
}
