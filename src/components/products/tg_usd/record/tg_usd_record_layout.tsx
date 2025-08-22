"use client"

import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import TgUsdMarketInfo from "./tg_usd_market_info"
import TgUsdLoanDetail from "./tg_usd_loan_detail"
import { formatBigInt } from "@/lib/number_formatter"
import TgUsdCollateralPrice from "./tg_usd_collateral_price"
import TgUsdRecordPageHeader from "./tg_usd_record_page_header"
import { useTgUsdRecordContext } from "./tg_usd_record_context"
import Divider from "@/components/design_system/structure/divider"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import BorderPanel from "@/components/design_system/structure/border_panel"
import TgUsdPositionHistory from "./position_history/tg_usd_position_history"
import { useTgUsdMaketListContext } from "../list/tg_usd_market_list_context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type TgUsdRecordLayoutProps = {
  children: React.ReactNode
}

export default function TgUsdRecordLayout({ children }: TgUsdRecordLayoutProps) {
  const { userData } = useTgUsdMaketListContext()

  const {
    collateral,
    isLeveraged,
    debtFarming,
    debtVAPR,
    chartData,
    feature,
    USGInfo,
    initialCollatAmount,
    setInitialCollatAmount,
    setDebtVAPR,
    setDebtFarming,
    setIsLeveraged,
  } = useTgUsdRecordContext()

  const router = useRouter()

  const onTabClick = (feat: string) => {
    if (feat === "deposit") {
      router.push(`/${collateral}`)
    } else {
      router.push(`/${collateral}/${feat}`)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <TgUsdRecordPageHeader />
        <Divider />
        <TgUsdLoanDetail />
      </div>
      <div className="my-4 flex flex-col gap-4">
        <div className="flex gap-4 max-xl:flex-col">
          <div className="rounded-[10px] bg-overlay-panel p-4 backdrop-blur-[60px] xl:w-5/12">
            <div className="mb-2 flex w-full justify-between gap-2">
              <ButtonTab className="w-full" active={feature === collateral} label={"Deposit"} onClick={() => onTabClick("deposit")} />
              <ButtonTab className="w-full" active={feature === "borrow"} label={"Borrow"} onClick={() => onTabClick("borrow")} />
              <ButtonTab className="w-full" active={feature === "leverage"} label={"Leverage"} onClick={() => onTabClick("leverage")} />
            </div>
            <div className="mb-4 flex w-full justify-between gap-2">
              <ButtonTab className="w-full" active={feature === "repay"} label={"Repay"} onClick={() => onTabClick("repay")} />
              <ButtonTab className="w-full" active={feature === "withdraw"} label={"Withdraw"} onClick={() => onTabClick("withdraw")} />
              <ButtonTab className="w-full" active={feature === "liquidate"} label={"Liquidate"} onClick={() => onTabClick("liquidate")} />
            </div>
            <Divider />
            <div className="mt-5">{children}</div>
          </div>
          <div className="flex w-full flex-col gap-2 xl:w-7/12">
            <TgUsdCollateralPrice />
          </div>
        </div>
        <Divider />
        <Accordion className="w-full" type="single" collapsible>
          <BorderPanel className="flex w-full cursor-pointer items-center justify-between bg-overlay-panel px-2 backdrop-blur-[60px]">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <span className="text-md py-3">vAPR Calculator</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex w-full flex-col items-center justify-center text-primary">
                  <div className="flex w-full items-start justify-start">
                    This calculator allows you to compute your position&lsquo;s net vAPR depending on USG&lsquo;s price. Note that the result will always be
                    accurate only for leveraged positions where all the debt has been converted to collateral. If you&lsquo;re using your debt to farm
                    elsewhere, you will need to regularly update your debt info (amount used to farm and vAPR) so the calculator displays a correct result.
                  </div>
                  <div className="flex w-full flex-col lg:flex-row">
                    <div className="mt-3 flex w-full flex-wrap items-center justify-center sm:flex-row sm:flex-nowrap lg:w-2/12 lg:flex-col">
                      <div className="flex w-full items-center justify-between rounded-[10px] bg-overlay-panel px-2 py-1 backdrop-blur-[60px]">
                        <span>Current vAPR</span>
                        <span className="flex items-center justify-center bg-button-active bg-clip-text font-semibold text-transparent">60.5%</span>
                      </div>
                      <div className="my-2 flex w-full items-center justify-center gap-1 lg:justify-end">
                        Leverage <Switch checked={isLeveraged} onCheckedChange={(v) => setIsLeveraged(v)} />
                      </div>

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
                          <div className="flex w-full flex-col items-center justify-center lg:items-start">
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
                          <div className="ml-2 mt-0 flex w-full flex-col items-center justify-center lg:ml-0 lg:mt-3 lg:items-start">
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
                    {!!chartData && !!userData && !!userData.totalUserDebt && !!userData.totalUserDeposit ? (
                      <div className="mt-8 flex w-full pr-6 lg:w-10/12">
                        <div className="relative hidden h-full items-start justify-start lg:flex">
                          <div className="absolute -top-6 left-16 text-lg font-semibold text-white">vAPR</div>
                        </div>
                        {chartData && (
                          <>
                            <ResponsiveContainer className="relative" width="100%" height={300}>
                              <LineChart data={chartData}>
                                <CartesianGrid horizontal={true} vertical={false} />

                                <XAxis
                                  dataKey="price"
                                  name="Price"
                                  tickFormatter={(value) => `$${value}`}
                                  interval={Math.max(1, Math.floor(chartData.length / 12) - 1)}
                                  reversed={true}
                                />

                                <YAxis
                                  name="vAPR"
                                  tickFormatter={(v) => `${formatBigInt(v, 18, 2)}%`}
                                  type="number"
                                  domain={[-2, Number(Math.max(...chartData.map((d) => d.vAPR))) * 1.5]}
                                />

                                <Legend formatter={(v) => (v === "vAPR" ? "vAPR (%)" : v)} />
                                <Tooltip
                                  content={({ active, payload, label }) =>
                                    active && payload?.length ? (
                                      <div className="flex min-w-28 flex-col items-center justify-center rounded-[10px] border border-white border-opacity-20 bg-input p-2 text-white backdrop-blur-[60px]">
                                        <div className="flex w-full items-center justify-between">
                                          <p className="font-semibold">vAPR:</p>
                                          <p>{formatBigInt(payload[0]?.value?.toString(), 18, 2)}%</p>
                                        </div>
                                        <div className="flex w-full items-center justify-between">
                                          <p className="font-semibold">Price:</p>
                                          <p>${label}</p>
                                        </div>
                                      </div>
                                    ) : null
                                  }
                                />

                                <Line strokeWidth="3px" type="monotone" dataKey="vAPR" stroke="url(#gradientColor)" name="vAPR (%)" dot={false} />

                                <ReferenceLine
                                  y={"0"}
                                  stroke="red"
                                  strokeDasharray="4 4"
                                  strokeWidth={2}
                                  ifOverflow="hidden"
                                  label={({ viewBox }) => {
                                    return (
                                      <text
                                        x={Number(viewBox?.x)}
                                        y={viewBox?.y + 4}
                                        dx={6}
                                        fill="red"
                                        fontSize={14}
                                        textAnchor="start"
                                        dominantBaseline="hanging"
                                      >
                                        0%
                                      </text>
                                    )
                                  }}
                                />

                                <ReferenceLine
                                  x={String(Number(USGInfo?.price))}
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
                                        ${USGInfo?.price} (USG Price)
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
                          <div className="absolute -right-4 bottom-0 text-lg font-semibold text-white">Price</div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-8 flex w-full pr-6 lg:w-10/12">
                        <div className="flex w-full items-center justify-center">You need active positions to be able to compute your vAPR</div>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </BorderPanel>
        </Accordion>
        <Divider />
        <TgUsdMarketInfo />
        <TgUsdPositionHistory />
      </div>
    </>
  )
}
