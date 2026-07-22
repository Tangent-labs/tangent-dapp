"use client"

import { useEffect, useMemo } from "react"
import { toast } from "react-toastify"
import { formatUnits } from "viem"
import { formatDollar } from "@/lib/number_formatter"
import { Switch } from "@/components/ui/switch"
import { useUSGRecordContext } from "../usg_record_context"
import { Button } from "@/components/design_system/inputs/button"
import { ToastComponent } from "@/components/design_system/toast"
import { Divider } from "@/components/design_system/structure/divider"
import { SliderInput } from "@/components/design_system/inputs/SliderInput"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { NeonLightCard } from "@/components/design_system/structure/neon_light_card"

type VAPRSimulation = {
  isLeveraged: boolean
  initialCollatAmount?: number
  simulatedCollatAmount?: number
  debtFarming: number
  debtVAPR: number
}

export const VAPRCalculator = () => {
  const {
    setDebtVAPR,
    setIsLeveraged,
    setInitialCollatAmount,
    setSimulatedCollatAmount,
    setDebtFarming,
    USGInfo,
    chartData,
    debtVAPR,
    isLeveraged,
    initialCollatAmount,
    simulatedCollatAmount,
    marketInfo,
    debtFarming,
    onChainData,
    marketData,
  } = useUSGRecordContext()

  const storageKey = useMemo(() => `vapr-calculator:${marketInfo?.marketAddress?.toLowerCase()}`, [marketInfo])

  const onClickSaveAndCompute = () => {
    const simulation: VAPRSimulation = {
      isLeveraged,
      debtFarming,
      debtVAPR,
      ...(isLeveraged ? { initialCollatAmount } : { simulatedCollatAmount }),
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(simulation))
      toast.info(ToastComponent, { data: { type: "Notification", content: "vAPR simulation saved." } })
    } catch (err) {
      console.error("Failed to save vAPR simulation : ", err)
    }
  }

  useEffect(() => {
    try {
      if (onChainData?.collateralInfos?.positionCollateralUSDValue) {
        const totalCollatUSD = Number(onChainData.collateralInfos.positionCollateralUSDValue / 10n ** 18n)

        // Collateral / leveraged collateral = the position's total; initial collateral = equity = total − debt.
        setSimulatedCollatAmount(totalCollatUSD)
      }

      const stored = localStorage.getItem(storageKey)
      if (!stored) return

      const simulation = JSON.parse(stored) as Partial<VAPRSimulation>

      setIsLeveraged(simulation.isLeveraged || false)
      setInitialCollatAmount(simulation.initialCollatAmount || 0)
      setSimulatedCollatAmount(simulation.simulatedCollatAmount || 0)
      setDebtFarming(simulation.debtFarming || 0)
      setDebtVAPR(simulation.debtVAPR || 0)
    } catch (err) {
      console.error("Failed to restore vAPR simulation : ", err)
    }
  }, [storageKey, onChainData])

  // feeds the bottom neon light card
  const positionMetrics = useMemo(() => {
    // find chartData item closest to the current USG price to determine the current net vAPR
    const netVAPR =
      chartData?.length && USGInfo?.price
        ? chartData.reduce((prev, cur) => (Math.abs(cur.price - USGInfo.price) < Math.abs(prev.price - USGInfo.price) ? cur : prev)).vAPR
        : 0

    const totalCollatUSD = onChainData?.collateralInfos?.positionCollateralUSDValue
      ? Number(formatUnits(onChainData.collateralInfos.positionCollateralUSDValue, 18))
      : 0

    const positionDebtUSD = onChainData?.debtInfos?.userDebt ? Number(formatUnits(onChainData.debtInfos.userDebt, 18)) : 0

    const collateralUSD = isLeveraged ? totalCollatUSD : simulatedCollatAmount

    const debtUSD = isLeveraged ? Math.max(0, totalCollatUSD - initialCollatAmount) : debtFarming || positionDebtUSD

    const accountedCollatAmount = isLeveraged ? initialCollatAmount : simulatedCollatAmount

    const yearlyGains = accountedCollatAmount * (netVAPR / 100)

    const ltFraction = marketData?.constants?.liquidationThreshold ? Number(marketData.constants.liquidationThreshold) / 100000 : 0
    const ltvValue = collateralUSD > 0 ? (debtUSD / collateralUSD) * 100 : 0
    const healthValue = debtUSD > 0 ? (collateralUSD * ltFraction) / debtUSD : 0

    return {
      "Net vAPR": `${netVAPR.toFixed(2)}%`,
      "Yearly gains": formatDollar(yearlyGains, 0),
      "Position's value": formatDollar(collateralUSD, 0),
      LTV: collateralUSD > 0 ? `${ltvValue.toFixed(2)}%` : "-",
      Health: debtUSD > 0 ? healthValue.toFixed(2) : "-",
    }
  }, [chartData, USGInfo, isLeveraged, initialCollatAmount, simulatedCollatAmount, debtFarming, onChainData, marketData])

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <ReliefCard className="hidden cursor-pointer flex-col px-2 text-xs lg:flex">
          <AccordionTrigger className="flex w-full justify-between">
            <span className="py-2 text-[18px] font-semibold text-white">vAPR Calculator</span>
          </AccordionTrigger>

          <AccordionContent>
            <div className="flex w-full flex-col items-center justify-center text-primary">
              <Divider />

              <div className="mb-4 mt-2 flex w-full items-start justify-start text-xs text-subtitle">
                This calculator allows you to compute your position&lsquo;s net vAPR depending on USG&lsquo;s price. Note that the result will always be
                accurate only for leveraged positions where all the debt has been converted to collateral. If you&lsquo;re using your debt to farm elsewhere,
                you will need to regurlaly update your debt info (amount used to farm and vAPR) so the calculator display a correct result.
              </div>

              <div className="flex w-full">
                <ReliefCard className="flex w-2/12 flex-col flex-wrap items-start justify-start p-3">
                  <span className="text-xl font-semibold text-white">Settings</span>

                  <div className="my-2 flex w-full items-center justify-between gap-1 text-xs text-subtitle">
                    Leverage <Switch checked={isLeveraged} onCheckedChange={(v) => setIsLeveraged(v)} />
                  </div>

                  {isLeveraged ? (
                    <div className="flex w-full flex-col items-center justify-center lg:items-start">
                      <div className="mb-1 text-xs text-subtitle">Initial collateral </div>
                      <input
                        placeholder=""
                        type="number"
                        step={1}
                        className="flex h-[30px] w-full flex-col items-center justify-center rounded-[10px] border border-white border-opacity-20 bg-overlay-panel p-2.5 text-xs font-semibold text-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        value={initialCollatAmount}
                        onChange={(e) => setInitialCollatAmount(Number(e?.target?.value))}
                      />
                    </div>
                  ) : (
                    <div className="flex w-full flex-col items-start justify-center">
                      <div className="mb-1 text-xs text-subtitle">Collateral</div>
                      <input
                        placeholder=""
                        type="number"
                        step={1}
                        className="flex h-[30px] w-full flex-col items-center justify-center rounded-[10px] border border-white border-opacity-20 bg-overlay-panel p-2.5 text-xs font-semibold text-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        value={simulatedCollatAmount}
                        onChange={(e) => setSimulatedCollatAmount(Number(e?.target?.value))}
                      />
                    </div>
                  )}

                  <div className="mt-2 flex w-full flex-col items-start justify-center">
                    <div className="mb-1 text-xs text-subtitle">Debt farming</div>
                    <input
                      placeholder=""
                      type="number"
                      step={1}
                      className="flex h-[30px] w-full flex-col items-center justify-center rounded-[10px] border border-white border-opacity-20 bg-overlay-panel p-2.5 text-xs font-semibold text-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      value={debtFarming}
                      onChange={(e) => setDebtFarming(Number(e?.target?.value))}
                    />
                  </div>

                  <div className="mt-2 flex w-full flex-col items-start justify-center">
                    <div className="mb-1 text-xs text-subtitle">Debt farming vAPR</div>

                    <div className="flex w-full items-center justify-between">
                      <input
                        placeholder=""
                        type="number"
                        step={1}
                        className="flex h-[30px] w-12 flex-col items-center justify-center rounded-[10px] border border-white border-opacity-20 bg-overlay-panel p-2.5 text-xs font-semibold text-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        value={debtVAPR}
                        onChange={(e) => setDebtVAPR(Math.min(100, Math.max(0, Number(e?.target?.value))))}
                      />

                      <div className="flex w-full flex-col items-center justify-center pl-2">
                        <SliderInput
                          disabled={false}
                          value={debtVAPR}
                          handleSliderChange={(e) => setDebtVAPR(Math.min(100, Math.max(0, Number(e?.target?.value))))}
                          legendValues={["0", "25", "50", "75", "100"]}
                          startEndRange={["0", "100", "1"]}
                          unit="%"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex w-full items-center justify-center">
                    <Button onClick={onClickSaveAndCompute}>Save and compute</Button>
                  </div>
                </ReliefCard>

                <div className="flex w-full flex-col lg:w-10/12">
                  <div className="relative mt-8 hidden items-start justify-start lg:flex">
                    <div className="absolute -top-7 left-6 text-lg font-semibold text-white">vAPR</div>
                  </div>
                  {chartData && (
                    <>
                      <div className="min-h-[300px] w-full flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 30, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid horizontal vertical={false} />

                            <XAxis
                              dataKey="price"
                              domain={[1.005, 0.9897]}
                              name="Price"
                              type="number"
                              tickFormatter={(value) => `$${value}`}
                              reversed={true}
                              ticks={Array.from({ length: 12 }, (_, i) => Number((0.988 + (i * (1.005 - 0.988)) / 12).toFixed(4)))}
                            />

                            <YAxis
                              name="vAPR"
                              tickFormatter={(v) => {
                                const formatted = v < 0 ? -v : v
                                const symbol = v < 0 ? "-" : ""
                                return `${symbol}${formatted?.toFixed(2)}%`
                              }}
                              type="number"
                              domain={[0, Number(Math.max(...chartData.map((d) => d.vAPR))) * 1.5 + 1]}
                            />

                            <Line strokeWidth="3px" type="monotone" dataKey="vAPR" stroke="url(#gradientColor)" name="vAPR (%)" dot={false} />

                            <Legend formatter={(v) => (v === "vAPR" ? "vAPR (%)" : v)} />

                            <ReferenceLine
                              y={"0"}
                              stroke="white"
                              strokeWidth={2}
                              ifOverflow="hidden"
                              label={({ viewBox }) => {
                                return (
                                  <text
                                    x={Number(viewBox?.x)}
                                    y={viewBox?.y + 6}
                                    dx={6}
                                    fill="white"
                                    fontSize={14}
                                    textAnchor="start"
                                    dominantBaseline="hanging"
                                  >
                                    0%
                                  </text>
                                )
                              }}
                            />

                            <Tooltip
                              content={({ active, payload, label }) =>
                                active && payload?.length ? (
                                  <div className="flex min-w-32 flex-col items-center justify-center rounded-[10px] border border-white border-opacity-20 bg-input p-2 text-white backdrop-blur-[60px]">
                                    <div className="flex w-full items-center justify-between">
                                      <p className="font-semibold">vAPR:</p>
                                      <p>{Number(payload[0]?.value).toFixed(2)}%</p>
                                    </div>
                                    <div className="flex w-full items-center justify-between">
                                      <p className="font-semibold">USG Price:</p>
                                      <p>${label}</p>
                                    </div>
                                  </div>
                                ) : null
                              }
                            />

                            <ReferenceLine
                              x={String(Number(USGInfo?.price) + 0.0001)}
                              stroke="white"
                              strokeDasharray="4 4"
                              strokeWidth={2}
                              ifOverflow="hidden"
                              label={({ viewBox }) => {
                                return (
                                  <text
                                    x={Number(viewBox?.x)}
                                    y={(viewBox?.y ?? 0) - 16}
                                    dx={6}
                                    fill="white"
                                    fontSize={14}
                                    textAnchor="start"
                                    dominantBaseline="hanging"
                                  >
                                    ${(USGInfo?.price).toFixed(3)} (USG Price)
                                  </text>
                                )
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <svg width="0" height="0">
                        <defs>
                          <linearGradient id="gradientColor" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0075ff" />
                            <stop offset="100%" stopColor="#00c2ff" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </>
                  )}
                  <div className="hidden items-end justify-end lg:relative lg:flex">
                    <div className="absolute bottom-0 right-2 text-lg font-semibold text-white">USG&apos;s Price</div>
                  </div>
                </div>
              </div>

              <NeonLightCard paddingHorizontal={0} className="mt-4 flex w-full" color1="#0077ffa3" color2="#0075FF">
                <div className="flex items-center gap-2 xl:gap-4">
                  <div className="flex w-full items-center justify-between py-0.5">
                    {Object.entries(positionMetrics).map(([label, value]) => (
                      <div key={label} className="flex-1 text-center">
                        <div className="text-center text-xs text-subtitle">{label}</div>
                        <div className="mt-1 text-center text-sm font-semibold">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </NeonLightCard>
            </div>
          </AccordionContent>
        </ReliefCard>
      </AccordionItem>
    </Accordion>
  )
}
