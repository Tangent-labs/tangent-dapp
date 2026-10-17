"use client"

import { useEffect, useMemo, useRef } from "react"
import { cn } from "@/lib/utils"
import { getWalletGradient, paintWalletGradient } from "@/lib/wallet_gradient"

type WalletAvatarProps = {
  address: string
  className?: string
}

// The gradient is smooth, so a tiny canvas stretched by CSS is enough (and very cheap)
const RESOLUTION = 48

// Film grain tile, same as the landing (fractal noise, desaturated)
const GRAIN_TILE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='110' height='110'><filter id='n' x='0' y='0' width='100%25' height='100%25'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

// Avatar generated from the wallet address: an organic, slowly moving blue gradient with film grain on top
export const WalletAvatar = ({ address, className }: WalletAvatarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const gradient = useMemo(() => getWalletGradient(address), [address])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    const image = context.createImageData(RESOLUTION, RESOLUTION)

    const draw = (seconds: number) => {
      paintWalletGradient(image.data, RESOLUTION, RESOLUTION, gradient, seconds)
      context.putImageData(image, 0, 0)
    }

    draw(0)

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0
    let isVisible = true

    const loop = (now: number) => {
      if (isVisible && !document.hidden) draw(now / 1000)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    // No need to draw while the avatar is off screen
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    })
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [gradient])

  return (
    <div className={cn("relative size-[60px] shrink-0 overflow-hidden rounded-lg", className)} aria-hidden>
      <canvas ref={canvasRef} width={RESOLUTION} height={RESOLUTION} className="absolute inset-0 size-full" />

      <div
        className="wallet-avatar-grain absolute -inset-[110px] opacity-35 mix-blend-overlay"
        style={{ backgroundImage: GRAIN_TILE, backgroundSize: "110px 110px" }}
      />

      <div className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" />

      <style jsx>{`
        .wallet-avatar-grain {
          animation: wallet-avatar-grain 0.9s steps(1, end) infinite;
        }
        @keyframes wallet-avatar-grain {
          0% {
            transform: translate(0, 0);
          }
          12.5% {
            transform: translate(-24px, 31px);
          }
          25% {
            transform: translate(35px, -19px);
          }
          37.5% {
            transform: translate(-46px, -35px);
          }
          50% {
            transform: translate(17px, 44px);
          }
          62.5% {
            transform: translate(-32px, 9px);
          }
          75% {
            transform: translate(42px, 26px);
          }
          87.5% {
            transform: translate(-10px, -48px);
          }
          100% {
            transform: translate(0, 0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .wallet-avatar-grain {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
