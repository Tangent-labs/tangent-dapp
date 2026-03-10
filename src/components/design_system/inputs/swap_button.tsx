"use client"

import { createRippleEffect } from "@/lib/animations"
import Link from "next/link"
import { useRef } from "react"

export const SwapButton = () => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <Link className="hidden md-lg:flex" href="/swap?tokenIn=0xb1c2db5d6ca03fce73dbd304d320bf76c55ae1b1&tokenOut=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48">
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
