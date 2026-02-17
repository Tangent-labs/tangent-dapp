type ButtonTabProps = {
  onClick: () => void
}

export default function MaxButton({ onClick }: ButtonTabProps) {
  return (
    <>
      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.85;
          }
          50% {
            opacity: 1;
          }
        }

        .pulse-bg {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div
        className="no-parent-hover relative h-5 w-10 min-w-10 cursor-pointer overflow-hidden rounded-[10px] text-xs transition-all duration-200 hover:scale-[1.03] hover:font-bold active:scale-95"
        onClick={() => {
          onClick()
        }}
      >
        {/* Background bleu avec pulse */}
        <div
          className="pulse-bg absolute inset-0 rounded-[10px]"
          style={{
            background: `linear-gradient(135deg, #0055ff 0%, #0088ff 50%, #0055ff 100%)`,
          }}
        />

        {/* Bordure  */}
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

        {/* Texte */}
        <span className="relative z-10 flex h-full select-none items-center justify-center">Max.</span>
      </div>
    </>
  )
}
