import { useState, useEffect, useRef } from "react"

export function createRippleEffect(e: any, refButton: any) {
  if (!refButton.current) return

  const btn = refButton.current
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

// hooks/useScrollDirection.ts

export function useScrollDirection(threshold = 10) {
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY

      if (currentY <= 0) {
        setIsVisible(true)
      } else if (Math.abs(currentY - lastScrollY.current) > threshold) {
        setIsVisible(currentY < lastScrollY.current)
      }

      lastScrollY.current = currentY
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])

  return isVisible
}
