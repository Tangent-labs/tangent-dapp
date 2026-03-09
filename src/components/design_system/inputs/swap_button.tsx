"use client"

import { createRippleEffect } from "@/lib/animations"
import Link from "next/link"
import { useRef } from "react"

export const SwapButton = () => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <Link className="md-lg:flex hidden" href="/swap">
      <div className="overflow-hidden rounded-[10px]">
        <button
          ref={buttonRef}
          onClick={(e) => createRippleEffect(e, buttonRef)}
          className="relative flex h-10 w-full max-w-24 items-center justify-center rounded-[10px] border border-[#0075FF] bg-dark px-4 text-sm font-semibold hover:bg-[#0060D2]"
        >
          Swap
        </button>
      </div>
    </Link>
  )
}
