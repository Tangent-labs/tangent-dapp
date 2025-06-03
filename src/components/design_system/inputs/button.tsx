"use client"

import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string
  children?: React.ReactNode
  state?: "active" | "inactive" | "disabled"
}

export function Button({ label, state = "active", className, disabled, children, ...props }: ButtonProps) {
  let stateCss = state === "disabled" ? "text-white bg-button-inactive" : ""
  stateCss += state === "active" ? " bg-button-active " : " bg-button-inactive "

  return (
    <button
      {...props}
      onClick={props?.onClick}
      disabled={state === "inactive" || disabled}
      className={cn(
        "flex items-center rounded-[10px] p-2 px-4 font-sans text-[15px] font-semibold transition-all duration-300 disabled:cursor-not-allowed",
        state === "active" ? "hover:bg-button-active-hover" : "",
        state === "inactive" ? "cursor-not-allowed" : "",
        stateCss,
        className || ""
      )}
    >
      {children ? children : <span className="">{label}</span>}
    </button>
  )
}
