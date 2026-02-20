"use client"

import { ButtonHTMLAttributes } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode
}

export function PopoverTriggerElement({ children, ...props }: ButtonProps) {
  return (
    <button {...props} className="flex w-full items-center justify-center">
      {children}
    </button>
  )
}
