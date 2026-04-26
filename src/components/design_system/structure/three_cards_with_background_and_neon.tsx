import { ReactNode } from "react"

interface KeyValue {
  key: string
  value: string | ReactNode
}

export function ThreeCardRowWithMask(props: { contents: [KeyValue, KeyValue, KeyValue] }) {
  const color1 = "#0077ff67"
  const color2 = "#0075FF"

  return (
    <div className="relative w-full">
      {/* Cards with individual backgrounds positioned to create continuity */}
      <div className="relative grid grid-cols-3 gap-[10px]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative overflow-hidden rounded-lg backdrop-blur-[60px]">
            {/* Continuous background image - positioned to align across all cards */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'url("/medias/card_bg_blocks.png")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.2,
                left: `calc(-${i * 100}% - ${i * 10}px)`,
                width: "calc(300% + 20px)",
              }}
            />

            {/* Continuous gradient - centered at 50% of the TOTAL width (middle card) */}
            <div
              className="absolute inset-0"
              style={{
                left: `calc(-${i * 100}% - ${i * 10}px)`,
                width: "calc(300% + 20px)",
                background: `
                  linear-gradient(0deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03)), 
                  radial-gradient(50.04% 50% at 50% 100%, ${color1} 0%, rgba(0, 0, 0, 0) 100%)
                `,
              }}
            />

            {/* Border gradient for this card - ALSO continuous */}
            <div
              className="pointer-events-none absolute inset-0 rounded-lg"
              style={{
                padding: "1px",
                left: `calc(-${i * 100}% - ${i * 10}px)`,
                width: "calc(300% + 20px)",
                background: `
                  radial-gradient(49.97% 49.97% at 50% 100%, #FFFFFF 0%,
                  ${color2} 19.71%, rgba(0, 0, 0, 0) 100%), 
                  linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%,
                  rgba(255, 255, 255, 0.1) 100%)
                `,
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />

            <div className="p-2 text-center xl:p-4">
              <h3 className="mb-1 text-xs text-subtitle">{props.contents[i].key}</h3>
              <div className="font-semibold text-white">{props.contents[i].value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
