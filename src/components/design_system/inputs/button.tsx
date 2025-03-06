"use client"

import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string
  children?: React.ReactNode
  state?: "active" | "inactive" | "disabled"
}

export function Button({ label, state = "active", className, disabled, children, ...props }: ButtonProps) {
  let stateCss = state === "disabled" ? "text-black" : ""
  stateCss += state === "active" ? "bg-button-active text-white" : ""

  return (
    <button
      {...props}
      onClick={props?.onClick}
      disabled={state === "disabled" || disabled}
      className={cn(
        "flex items-center rounded-[10px] border border-white border-opacity-50 p-2 px-4 font-sans text-xs font-semibold transition-all duration-300 hover:bg-white hover:bg-opacity-[3%] disabled:cursor-not-allowed disabled:bg-gray-400 disabled:bg-opacity-40",
        stateCss,
        className || ""
      )}
    >
      {children ? children : <span className=" ">{label}</span>}
    </button>
  )
}
