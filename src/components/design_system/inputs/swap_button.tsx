"use client"

import Link from "next/link"
import { useRef } from "react"

export const SwapButton = () => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const createRippleEffect = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return

    const btn = buttonRef.current
    const rect = btn.getBoundingClientRect()

    // Max(width and height) / 2 because we have long and thin buttons
    const diameter = Math.max(rect.width, rect.height) / 2
    const radius = diameter / 2

    const x = e.clientX - rect.left - radius
    const y = e.clientY - rect.top - radius

    const ripple = document.createElement("span")

    ripple.className = "absolute z-0 rounded-full pointer-events-none bg-button-active-dark animate-ripple"

    ripple.style.width = ripple.style.height = `${diameter}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`

    btn.appendChild(ripple)

    setTimeout(() => ripple.remove(), 1500)
  }

  return (
    <Link className="hidden xl:flex" href="/swap">
      <button
        ref={buttonRef}
        onClick={createRippleEffect}
        className="relative flex w-full max-w-24 items-center justify-center rounded-[10px] border border-[#0075FF] bg-dark p-2 px-4 font-gilroy text-[15px] font-semibold hover:bg-[#0060D2]"
      >
        Swap
      </button>
    </Link>
  )
}
