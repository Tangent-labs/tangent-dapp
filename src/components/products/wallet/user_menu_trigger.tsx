"use client"

import { ButtonHTMLAttributes } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode
}

export function UserMenuTrigger({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className="flex w-full max-w-36 items-center justify-center rounded-[10px] border border-[#0075FF] bg-button-active px-4 py-2 font-gilroy text-[15px] font-semibold transition-all duration-200 hover:bg-[#0060D2] hover:bg-button-active-hover disabled:cursor-not-allowed"
    >
      {children}
    </button>
  )
}
