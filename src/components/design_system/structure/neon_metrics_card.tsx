import { ReactNode } from "react"
import { NeonLightCard } from "./neon_light_card"

type NeonMetricCardProps = {
  title: string
  subtitle: ReactNode
  value: ReactNode
  extra?: ReactNode
  color1: string
  color2: string
  className?: string
}

export function NeonMetricsCard({ title, subtitle, value, extra, color1, color2, className }: NeonMetricCardProps) {
  return (
    <div className={`relative w-full ${className ?? ""}`}>
      <div className="absolute -top-2 left-0 z-20 flex w-full justify-center">
        <div style={{ background: color1 }} className="rounded-full px-6 text-xs font-semibold text-black">
          {title}
        </div>
      </div>

      <NeonLightCard color1={color1} color2={color2} className="w-full">
        <span className="mt-1 flex w-full items-center justify-center text-sm text-subtitle">{subtitle}</span>

        <div className="mb-2 flex items-center justify-center gap-1">
          <span className="text-sm font-semibold text-white">{value}</span>
          {extra ? <span className="bg-tonic bg-clip-text text-xs font-semibold text-transparent">{extra}</span> : null}
        </div>
      </NeonLightCard>
    </div>
  )
}
