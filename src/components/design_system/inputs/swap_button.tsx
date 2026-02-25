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
      <div className="overflow-hidden rounded-[10px]">
        <button
          ref={buttonRef}
          onClick={createRippleEffect}
          className="relative flex h-10 w-full max-w-24 items-center justify-center rounded-[10px] border border-[#0075FF] bg-dark px-4 text-sm font-semibold hover:bg-[#0060D2]"
        >
          Swap
        </button>
      </div>
    </Link>
  )
}
