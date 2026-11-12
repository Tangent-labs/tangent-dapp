"use client"

import { useMemo, useState } from "react"
import { toast } from "react-toastify"
import { formatDollar } from "@/lib/number_formatter"
import { ToastComponent } from "@/components/design_system/toast"
import { NeonLightCard } from "@/components/design_system/structure/neon_light_card"
import { CalculatorSettings } from "./CalculatorSettings"
import { VAPRChart } from "./VAPRChart"
import {
  CalculatorInputs,
  CalculatorMode,
  computePositionMetrics,
  getDefaultInputs,
  getSimulationFromInputs,
  saveSimulation,
  simulateVAPRCurve,
} from "../dashboard_user_calculator"
import type { BorrowPosition } from "../dashboard_user_type"

type PositionCalculatorProps = {
  position: BorrowPosition
  usgPrice: number
  initialInputs: CalculatorInputs
  // Called once the simulation has been saved, so the row can refresh its Net vAPR
  onSaved: (inputs: CalculatorInputs) => void
}

export const PositionCalculator = ({ position, usgPrice, initialInputs, onSaved }: PositionCalculatorProps) => {
  const [inputs, setInputs] = useState<CalculatorInputs>(initialInputs)

  const update = (patch: Partial<CalculatorInputs>) =>
    setInputs((prev) => {
      // Turning the leverage on with nothing filled: start from the current position (debt converted to collateral),
      // so the chart is not empty
      const isFirstLeverage = patch.isLeveraged && prev.initialCollateralUsd === 0 && prev.totalCollateralUsd === 0
      const leveragePreset = isFirstLeverage
        ? { totalCollateralUsd: position.depositedUsd, initialCollateralUsd: Math.max(0, position.depositedUsd - position.debt) }
        : {}

      return { ...prev, ...leveragePreset, ...patch }
    })

  const onChangeMode = (mode: CalculatorMode) => {
    // Going back to the existing position resets the amounts to the real ones
    const { collateralUsd, debtUsd } = getDefaultInputs(position)
    update(mode === "existing" ? { mode, collateralUsd, debtUsd } : { mode })
  }

  const chartData = useMemo(() => simulateVAPRCurve(position, inputs), [position, inputs])

  const metrics = useMemo(() => computePositionMetrics(position, inputs, usgPrice), [position, inputs, usgPrice])

  const onClickSaveAndCompute = () => {
    if (saveSimulation(position.marketAddress, getSimulationFromInputs(inputs))) {
      toast.info(ToastComponent, { data: { type: "Notification", content: "vAPR simulation saved." } })
      onSaved(inputs)
    }
  }

  const summary = [
    { label: "Net vAPR", value: `${metrics.netVAPR.toFixed(2)}%` },
    { label: "Net yearly gains", value: formatDollar(metrics.yearlyGains, 0) },
    { label: "LTV", value: metrics.ltv === null ? "-" : `${metrics.ltv.toFixed(2)}%` },
  ]

  return (
    <div className="flex w-full flex-col gap-5 p-2.5">
      <div className="flex w-full flex-col items-start gap-3 xl:flex-row xl:gap-5">
        <p className="w-full text-xs text-subtitle xl:w-1/2">
          This calculator allows you to compute your position&rsquo;s net vAPR depending on USG&rsquo;s price. Note that the result will always be accurate only
          for leveraged positions where all the debt has been converted to collateral. If you&rsquo;re using your debt to farm elsewhere, you will need to
          regularly update your debt info (amount used to farm and vAPR) so the calculator display a correct result.
        </p>

        <NeonLightCard paddingHorizontal={0} className="flex w-full xl:w-1/2" color1="#0077ffa3" color2="#0075FF">
          <div className="grid w-full grid-cols-3 items-center py-0.5">
            {summary.map(({ label, value }, i) => (
              <div key={label} className={i > 0 ? "border-l border-white/10 text-center" : "text-center"}>
                <div className="text-xs text-subtitle">{label}</div>
                <div className="mt-1 text-sm font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </NeonLightCard>
      </div>

      <div className="flex w-full flex-col gap-5 xl:flex-row">
        <CalculatorSettings inputs={inputs} onChange={update} onChangeMode={onChangeMode} onSave={onClickSaveAndCompute} />

        {/* CHART */}
        <div className="min-w-0 flex-1">
          <VAPRChart data={chartData} usgPrice={usgPrice} />
        </div>
      </div>
    </div>
  )
}
