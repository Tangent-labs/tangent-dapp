import { HTMLAttributes, forwardRef } from "react"

type ReliefCardProps = HTMLAttributes<HTMLDivElement>

export const ReliefCard = forwardRef<HTMLDivElement, ReliefCardProps>(({ children, className = "", ...props }, ref) => {
  return (
    <div ref={ref} {...props} className={`relative rounded-lg bg-overlay-panel backdrop-blur-[60px] [clip-path:inset(0_round_0.5rem)] ${className}`}>
      {/* Gradient border effect */}
      <div
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{
          border: "1px solid transparent",
          background: "linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%, rgba(255, 255, 255, 0.1) 100%) border-box",
          WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {children}
    </div>
  )
})

ReliefCard.displayName = "ReliefCard"
