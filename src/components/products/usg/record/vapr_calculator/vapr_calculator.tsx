import { BorderPanel } from "@/components/design_system/structure/border_panel"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useUSGRecordContext } from "../usg_record_context"
import { Switch } from "@/components/ui/switch"
import { Divider } from "@/components/design_system/structure/divider"
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export const VAPRCalculator = () => {
  const {
    setDebtVAPR,
    setDebtFarming,
    setIsLeveraged,
    setSimulatedDebtAmount,
    setInitialCollatAmount,
    setSimulatedCollatAmount,
    USGInfo,
    chartData,
    debtVAPR,
    debtFarming,
    isLeveraged,
    onChainData,
    initialCollatAmount,
    simulatedDebtAmount,
    simulatedCollatAmount,
  } = useUSGRecordContext()

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <BorderPanel className="hidden cursor-pointer flex-col bg-white bg-opacity-[3%] px-2 text-xs text-primary backdrop-blur-[60px] lg:flex">
          <AccordionTrigger className="flex w-full justify-between">
            <span className="py-2 text-sm text-white">vAPR Calculator</span>
          </AccordionTrigger>

          <AccordionContent>
            <div className="flex w-full flex-col items-center justify-center text-primary">
              <Divider />

              <div className="my-4 flex w-full items-start justify-start text-xs text-subtitle">
                This calculator allows you to compute your position&lsquo;s net vAPR depending on USG&lsquo;s price. Note that the result will always be
                accurate only for leveraged positions where all the debt has been converted to collateral. If you&lsquo;re using your debt to farm elsewhere,
                you will need to regurlaly update your debt info (amount used to farm and vAPR) so the calculator display a correct result.
              </div>

              <div className="flex w-full">
                <div className="flex w-2/12 flex-col flex-wrap items-start justify-start rounded-[10px] bg-overlay-panel p-3">
                  <span className="text-xl font-semibold text-white">Settings</span>

                  <div className="my-2 flex w-full items-center justify-between gap-1 text-xs text-subtitle">
                    Leverage <Switch checked={isLeveraged} onCheckedChange={(v) => setIsLeveraged(v)} />
                  </div>

                  {onChainData?.collateralInfos?.positionCollateralUSDValue === 0n && (
                    <>
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

                      <div className="mt-1 flex w-full flex-col items-start justify-center">
                        <div className="mb-1 text-xs text-subtitle">Debt farming</div>
                        <input
                          placeholder=""
                          type="number"
                          step={1}
                          className="flex h-[30px] w-full flex-col items-center justify-center rounded-[10px] border border-white border-opacity-20 bg-overlay-panel p-2.5 text-xs font-semibold text-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          value={simulatedDebtAmount}
                          onChange={(e) => setSimulatedDebtAmount(Number(e?.target?.value))}
                        />
                      </div>

                      <Divider className="h-0.5 w-full bg-white/10" />
                    </>
                  )}
                  {isLeveraged ? (
                    <div className="flex w-full flex-col items-center justify-center lg:items-start">
                      <div className="mb-1 text-xs font-semibold text-subtitle">Initial Collateral (USD)</div>
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
                    <>
                      <div className="flex w-full flex-col items-start justify-center">
                        <div className="mb-1 text-xs font-semibold text-subtitle">Debt Farming (USD)</div>
                        <input
                          placeholder=""
                          type="number"
                          step={1}
                          className="flex h-[30px] w-full flex-col items-center justify-center rounded-[10px] border border-white border-opacity-20 bg-overlay-panel p-2.5 text-xs font-semibold text-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          value={debtFarming}
                          onChange={(e) => setDebtFarming(Number(e?.target?.value))}
                        />
                      </div>
                      <div className="ml-0 mt-2 flex w-full flex-col items-start justify-center">
                        <div className="mb-1 text-xs font-semibold text-subtitle">Debt vAPR (%)</div>
                        <input
                          placeholder=""
                          type="number"
                          step={0.1}
                          className="flex h-[30px] w-full flex-col items-center justify-center rounded-[10px] border border-white border-opacity-20 bg-overlay-panel p-2.5 text-xs font-semibold text-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          value={debtVAPR}
                          onChange={(e) => setDebtVAPR(Number(e?.target?.value))}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex w-full flex-col lg:w-10/12">
                  <div className="relative mt-8 hidden h-full items-start justify-start lg:flex">
                    <div className="absolute -top-7 left-16 text-lg font-semibold text-white">vAPR</div>
                  </div>
                  {chartData && (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
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
                            stroke="red"
                            strokeDasharray="4 4"
                            strokeWidth={2}
                            ifOverflow="hidden"
                            label={({ viewBox }) => {
                              return (
                                <text x={Number(viewBox?.x)} y={viewBox?.y + 4} dx={6} fill="red" fontSize={14} textAnchor="start" dominantBaseline="hanging">
                                  0%
                                </text>
                              )
                            }}
                          />

                          <Tooltip
                            content={({ active, payload, label }) =>
                              active && payload?.length ? (
                                <div className="flex min-w-28 flex-col items-center justify-center rounded-[10px] border border-white border-opacity-20 bg-input p-2 text-white backdrop-blur-[60px]">
                                  <div className="flex w-full items-center justify-between">
                                    <p className="font-semibold">vAPR:</p>
                                    <p>{Number(payload[0]?.value).toFixed(2)}%</p>
                                  </div>
                                  <div className="flex w-full items-center justify-between">
                                    <p className="font-semibold">Price:</p>
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
                                  y={(viewBox?.y ?? 0) + 8}
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
                  <div className="hidden h-full items-end justify-end lg:relative lg:flex">
                    <div className="absolute bottom-0 right-2 text-lg font-semibold text-white">Price</div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </BorderPanel>
      </AccordionItem>
    </Accordion>
  )
}
