import { ReactNode } from "react"

export function NeonLightCard(props: { color1: string; color2: string; className: string; children: ReactNode }) {
  return (
    <div className={`flex overflow-hidden rounded-lg ${props.className}`}>
      <div
        className="shadow-2x relative w-full rounded-lg px-4 py-2"
        style={{
          background: `
          linear-gradient(0deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03)), radial-gradient(50.04% 50% at 50.04% 100%, ${props.color1} 0%,rgba(0, 0, 0, 0) 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-lg"
          style={{
            padding: "1px",
            background: `
            radial-gradient(49.97% 49.97% at 50.03% 100%, #FFFFFF 0%,
            ${props.color2} 19.71%, rgba(0, 0, 0, 0) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%,
            rgba(255, 255, 255, 0.1) 100%)`,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        {props.children}
      </div>
    </div>
  )
}
