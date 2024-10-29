"use client"

import { cn } from "@/lib/utils"

type ButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  label: string
  state?: "active" | "inactive" | "disabled"
}

export function Button({ label, state = "active", ...props }: ButtonProps) {
  let stateCss = state === "disabled" ? "text-black bg-button-active grayscale-[100%]" : ""
  stateCss += state === "active" ? "bg-button-active text-black" : ""
  stateCss += state === "inactive" ? " cursor-not-allowed" : ""

  return (
    <button
      onClick={props?.onClick}
      disabled={state === "disabled"}
      className={cn(
        props?.className || "",
        "flex items-center rounded-[10px] border border-white border-opacity-50 p-2 px-4 font-sans text-xs font-semibold transition-all duration-300 hover:bg-white hover:bg-opacity-[3%] disabled:cursor-not-allowed",
        stateCss
      )}
    >
      <span className=" ">{label}</span>
    </button>
  )
}
