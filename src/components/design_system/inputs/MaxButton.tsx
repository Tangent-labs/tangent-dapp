import { cn } from "@/lib/utils"

type ButtonTabProps = {
  onClick: () => void
  className?: string
}

export function MaxButton({ onClick, className }: ButtonTabProps) {
  return (
    <div
      className={cn(
        "no-parent-hover relative h-5 w-10 min-w-10 cursor-pointer overflow-hidden rounded-[10px] text-xs transition-all duration-200 hover:scale-[1.03] hover:font-semibold active:scale-95",
        className
      )}
      onClick={() => {
        onClick()
      }}
    >
      {/* Blue background*/}
      <div
        className="absolute inset-0 rounded-[10px]"
        style={{
          background: `linear-gradient(135deg, #0055ff 0%, #0088ff 50%, #0055ff 100%)`,
        }}
      />

      {/* Border  */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[10px]"
        style={{
          padding: "1px",
          background: `
          linear-gradient(0deg, rgba(255, 255, 255, 0) 60%, rgba(255, 255, 255, 0.2) 100%)`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Text */}
      <span className="relative z-10 flex h-full select-none items-center justify-center">Max.</span>
    </div>
  )
}
