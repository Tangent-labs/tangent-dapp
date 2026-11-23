"use client"

import { cn } from "@/lib/utils"

/**
 * Wallet avatar: a lit sphere whose hues come from the address, so each wallet keeps its own orb.
 * Pure CSS (no shader dependency added to the live repo); the slow spin stops with prefers-reduced-motion.
 */
export function WalletOrb({ address, size = 24, className }: { address?: string; size?: number; className?: string }) {
  const seed = parseInt((address ?? "0x0075ff").slice(2, 10) || "0", 16) || 0x0075ff
  // stay in the blue family (190 to 260) with one warmer accent, so orbs read as Tangent, not rainbow
  const h1 = 195 + (seed % 60)
  const h2 = 210 + ((seed >> 8) % 50)
  const h3 = (seed >> 16) % 2 ? 265 : 175
  return (
    <span
      aria-hidden
      className={cn("relative inline-block shrink-0 overflow-hidden rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 32% 28%, hsl(${h1} 100% 82%) 0%, hsl(${h2} 95% 52%) 38%, hsl(${h3} 70% 22%) 78%, #050507 100%)`,
        boxShadow: "inset -2px -3px 6px rgba(0,0,0,0.45), inset 1px 1px 2px rgba(255,255,255,0.25)",
      }}
    >
      <span
        className="absolute inset-0 rounded-full opacity-60 mix-blend-screen motion-safe:animate-[spin_9s_linear_infinite]"
        style={{
          background: `conic-gradient(from ${seed % 360}deg, transparent 0deg, hsl(${h3} 90% 65% / 0.5) 70deg, transparent 150deg, hsl(${h1} 90% 70% / 0.35) 250deg, transparent 330deg)`,
        }}
      />
    </span>
  )
}
