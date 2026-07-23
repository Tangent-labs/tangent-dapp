"use client"

import { useEffect, useMemo } from "react"
import { toast } from "react-toastify"
import { formatUnits } from "viem"
import { AnimatePresence, motion } from "framer-motion"
import { formatDollar } from "@/lib/number_formatter"
import { Switch } from "@/components/ui/switch"
import { IconCircleHelp } from "@/components/icons"
import { useUSGRecordContext } from "../usg_record_context"
import { Button } from "@/components/design_system/inputs/button"
import { ToastComponent } from "@/components/design_system/toast"
import { Divider } from "@/components/design_system/structure/divider"
import { SliderInput } from "@/components/design_system/inputs/SliderInput"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { NeonLightCard } from "@/components/design_system/structure/neon_light_card"

type VAPRSimulation = {
  isLeveraged: boolean
  initialCollatAmount?: number
  leveragedCollatAmount?: number
  simulatedCollatAmount?: number
  debtFarming: number
  debtVAPR: number
}

const INPUT_BASE =
  "flex h-[34px] flex-col items-center justify-center rounded-[10px] border border-white border-opacity-20 bg-overlay-panel p-2.5 text-xs font-semibold text-white placeholder:text-subtitle/60 focus-visible:border-opacity-40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"

// Gentle slide used both by the collateral swap and by the fields below it as they reflow.
const LAYOUT_TRANSITION = { layout: { duration: 0.28, ease: "easeInOut" }, opacity: { duration: 0.2 } } as const

const InputLabel = ({ label, info }: { label: string; info: string }) => (
  <div className="mb-1 flex items-center gap-1 text-xs text-subtitle">
    {label}
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button type="button" className="flex items-center">
          <IconCircleHelp className="h-auto w-[11px] fill-subtitle" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="start" className="z-[9999] w-fit max-w-56 p-2 text-xs">
        {info}
      </HoverCardContent>
    </HoverCard>
  </div>
)

export const VAPRCalculator = () => {
  const {
    setDebtVAPR,
    setIsLeveraged,
    setInitialCollatAmount,
    setLeveragedCollatAmount,
    setSimulatedCollatAmount,
    setDebtFarming,
    USGInfo,
    chartData,
    debtVAPR,
    isLeveraged,
    initialCollatAmount,
    leveragedCollatAmount,
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
      ...(isLeveraged ? { initialCollatAmount, leveragedCollatAmount } : { simulatedCollatAmount }),
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
      setLeveragedCollatAmount(simulation.leveragedCollatAmount || 0)
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

    const positionDebtUSD = onChainData?.debtInfos?.userDebt ? Number(formatUnits(onChainData.debtInfos.userDebt, 18)) : 0

    const collateralUSD = isLeveraged ? initialCollatAmount + leveragedCollatAmount : simulatedCollatAmount

    const debtUSD = isLeveraged ? leveragedCollatAmount + debtFarming || positionDebtUSD : debtFarming || positionDebtUSD

    const accountedCollatAmount = isLeveraged ? initialCollatAmount : simulatedCollatAmount

    const yearlyGains = accountedCollatAmount * (netVAPR / 100)

    const positionValue = accountedCollatAmount + debtUSD

    const ltFraction = marketData?.constants?.liquidationThreshold ? Number(marketData.constants.liquidationThreshold) / 100000 : 0
    const ltvValue = collateralUSD > 0 ? (debtUSD / collateralUSD) * 100 : 0
    const healthValue = debtUSD > 0 ? (collateralUSD * ltFraction) / debtUSD : 0

    return {
      "Net vAPR": `${netVAPR.toFixed(2)}%`,
      "Yearly gains": formatDollar(yearlyGains, 0),
      "Position's value": (
        <span className="flex items-baseline justify-center gap-1">
          {formatDollar(positionValue, 0)}
          <span className="text-[10px] font-normal text-subtitle">(Collateral + debt)</span>
        </span>
      ),
      LTV: collateralUSD > 0 ? `${ltvValue.toFixed(2)}%` : "-",
      Health: debtUSD > 0 ? healthValue.toFixed(2) : "-",
    }
  }, [chartData, USGInfo, isLeveraged, initialCollatAmount, leveragedCollatAmount, simulatedCollatAmount, debtFarming, onChainData, marketData])

  // Adaptive Y range so the curve (which goes negative under leverage) is always visible, with 0 kept in view.
  const yAxisDomain = useMemo<[number, number]>(() => {
    if (!chartData?.length) return [-1, 1]
    const values = chartData.map((d) => d.vAPR)
    const lo = Math.min(0, ...values)
    const hi = Math.max(0, ...values)
    const pad = Math.max((hi - lo) * 0.15, 1)
    return [lo - pad, hi + pad]
  }, [chartData])

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

              <div className="flex w-full gap-4">
                <ReliefCard className="flex w-1/4 flex-col items-start justify-start gap-3 p-4">
                  <span className="text-xl font-semibold text-white">Settings</span>

                  <div className="flex w-full items-center justify-between gap-1">
                    <InputLabel label="Leverage" info="Simulate a leveraged position where borrowed USG is used to buy additional collateral." />
                    <Switch checked={isLeveraged} onCheckedChange={(v) => setIsLeveraged(v)} />
                  </div>

                  <AnimatePresence initial={false} mode="popLayout">
                    {isLeveraged ? (
                      <motion.div
                        key="leveraged-collateral"
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={LAYOUT_TRANSITION}
                        className="flex w-full flex-col gap-3"
                      >
                        <div className="flex w-full flex-col items-start justify-center">
                          <InputLabel label="Initial collateral" info="The collateral you deposit yourself, before borrowing — your equity." />
                          <input
                            placeholder="0"
                            type="number"
                            step={1}
                            className={`${INPUT_BASE} w-full`}
                            value={initialCollatAmount || ""}
                            onChange={(e) => setInitialCollatAmount(Number(e?.target?.value))}
                          />
                        </div>

                        <div className="flex w-full flex-col items-start justify-center">
                          <InputLabel label="Leveraged collateral" info="Extra collateral bought with borrowed USG, on top of your initial collateral." />
                          <input
                            placeholder="0"
                            type="number"
                            step={1}
                            className={`${INPUT_BASE} w-full`}
                            value={leveragedCollatAmount || ""}
                            onChange={(e) => setLeveragedCollatAmount(Number(e?.target?.value))}
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="simulated-collateral"
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={LAYOUT_TRANSITION}
                        className="flex w-full flex-col items-start justify-center"
                      >
                        <InputLabel label="Collateral" info="The USD value of collateral deposited in this position." />
                        <input
                          placeholder="0"
                          type="number"
                          step={1}
                          className={`${INPUT_BASE} w-full`}
                          value={simulatedCollatAmount || ""}
                          onChange={(e) => setSimulatedCollatAmount(Number(e?.target?.value))}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div layout transition={LAYOUT_TRANSITION} className="flex w-full flex-col items-start justify-center">
                    <InputLabel label="Debt farming" info="Share of the total debt currently yielding." />
                    <input
                      placeholder="0"
                      type="number"
                      step={1}
                      className={`${INPUT_BASE} w-full`}
                      value={debtFarming || ""}
                      onChange={(e) => setDebtFarming(Number(e?.target?.value))}
                    />
                  </motion.div>

                  <motion.div layout transition={LAYOUT_TRANSITION} className="flex w-full flex-col items-start justify-center">
                    <InputLabel label="Debt farming vAPR" info="The vAPR earned on the debt-farming amount above." />

                    <div className="flex w-full items-center justify-between">
                      <input
                        placeholder="0"
                        type="number"
                        step={1}
                        className={`${INPUT_BASE} w-12`}
                        value={debtVAPR || ""}
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
                  </motion.div>

                  <motion.div layout transition={LAYOUT_TRANSITION} className="mt-1 flex w-full items-center justify-center">
                    <Button onClick={onClickSaveAndCompute}>Save and compute</Button>
                  </motion.div>
                </ReliefCard>

                <div className="flex w-full flex-col lg:w-3/4">
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
                              domain={yAxisDomain}
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
