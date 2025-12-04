"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import USGMarketInfo from "./tg_usd_market_info"
import USGLoanDetail from "./tg_usd_loan_detail"
import { formatBigInt } from "@/lib/number_formatter"
import USGRecordPageHeader from "./tg_usd_record_page_header"
import { useUSGRecordContext } from "./tg_usd_record_context"
import { MarketDetails } from "./header/market_details_header"
import Divider from "@/components/design_system/structure/divider"
import USGCollateralPrice from "./collat_price/collat_price_content"
import { FeatureTabs } from "@/components/design_system/inputs/feature_tabs"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { CollateralPriceProvider } from "./collat_price/collat_price_context"
import TgUsdPositionHistory from "./position_history/tg_usd_position_history"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type USGRecordLayoutProps = {
  children: React.ReactNode
}

export default function USGRecordLayout({ children }: USGRecordLayoutProps) {
  const {
    USGInfo,
    feature,
    debtVAPR,
    chartData,
    collateral,
    debtFarming,
    isLeveraged,
    canLeverage,
    onChainData,
    initialCollatAmount,
    currentTotalMarketApr,
    setDebtVAPR,
    setDebtFarming,
    setIsLeveraged,
    setInitialCollatAmount,
    setIsDepositAndBorrow,
    setIsRepayAndWithdraw,
    isDepositAndBorrow,
    isRepayAndWithdraw,
    setActiveTab,
    activeTab,
  } = useUSGRecordContext()

  const router = useRouter()

  const path = usePathname()

  const onTabClick = (feat: string) => {
    if (feat.toLowerCase() === "deposit") {
      router.push(`/${collateral}`)
      setIsDepositAndBorrow(false)
    } else if (feat.toLowerCase() === "deposit&borrow") {
      router.push(`/${collateral}`)
      setIsDepositAndBorrow(true)
    } else if (feat.toLowerCase() === "repay") {
      router.push(`/${collateral}/${feat.toLowerCase()}`)
      setIsRepayAndWithdraw(false)
    } else if (feat.toLowerCase() === "repay&withdraw") {
      router.push(`/${collateral}/repay`)
      setIsRepayAndWithdraw(true)
    } else {
      router.push(`/${collateral}/${feat.toLowerCase()}`)
    }
  }

  const onClickBorrow = () => {
    setActiveTab("Borrow")
    router.push(`/${collateral}`)
    setIsDepositAndBorrow(true)
  }

  const onClickRepay = () => {
    setActiveTab("Repay")
    router.push(`/${collateral}/repay`)
    setIsRepayAndWithdraw(true)
  }

  const onTabClickLeverage = () => {
    if (canLeverage) {
      onTabClick("leverage")
    }
  }

  const setupNavigationOnInit = () => {
    const lastIndexOfSlash = path?.lastIndexOf("/") + 1
    const feat = path.substring(lastIndexOfSlash, path.length)

    if (feat === "repay" || feat === "withdraw" || feat === "liquidate") {
      setIsDepositAndBorrow(false)
      setIsRepayAndWithdraw(true)
      setActiveTab("Repay")
    }
  }

  useEffect(() => {
    setupNavigationOnInit()
  }, [])

  return (
    <>
      <USGRecordPageHeader />

      <MarketDetails />

      <div className="my-4 flex flex-col gap-4">
        <div className="relative flex items-start justify-start gap-4 max-xl:flex-col">
          <div className="w-full rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px] xl:w-5/12">
            <FeatureTabs
              feature={feature}
              activeTab={activeTab}
              collateral={collateral}
              isRepayAndWithdraw={isRepayAndWithdraw}
              isDepositAndBorrow={isDepositAndBorrow}
              canLeverage={canLeverage}
              onTabClick={onTabClick}
              onTabClickLeverage={onTabClickLeverage}
              onClickBorrow={onClickBorrow}
              onClickRepay={onClickRepay}
            ></FeatureTabs>

            <div className="mt-2">{children}</div>
          </div>

          <div className="flex w-full flex-col gap-2 self-start xl:sticky xl:top-24 xl:w-7/12">
            <USGLoanDetail />

            <CollateralPriceProvider>
              <USGCollateralPrice />
            </CollateralPriceProvider>
          </div>
        </div>

        <Divider className="hidden xl:flex" />

        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <BorderPanel className="flex cursor-pointer flex-col bg-white bg-opacity-[3%] px-2 text-xs text-primary backdrop-blur-[60px]">
              <AccordionTrigger className="flex w-full justify-between">
                <span className="py-2 text-sm text-white">vAPR Calculator</span>
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
                        <span className="flex items-center justify-center bg-button-active bg-clip-text font-semibold text-transparent">
                          {currentTotalMarketApr} %
                        </span>
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
                    {!!chartData && !!onChainData?.collateralInfos?.positionCollateralUSDValue && !!onChainData?.debtInfos.userDebt ? (
                      <div className="mt-8 flex w-full pr-6 lg:w-10/12">
                        <div className="relative hidden h-full items-start justify-start lg:flex">
                          <div className="absolute -top-6 left-16 text-lg font-semibold text-white">vAPR</div>
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
                                    const formatted = formatBigInt(v < 0 ? -v : v, 18, 2)
                                    const symbol = v < 0 ? "-" : ""
                                    return `${symbol}${formatted}%`
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

                                <Tooltip
                                  content={({ active, payload, label }) =>
                                    active && payload?.length ? (
                                      <div className="flex min-w-28 flex-col items-center justify-center rounded-[10px] border border-white border-opacity-20 bg-input p-2 text-white backdrop-blur-[60px]">
                                        <div className="flex w-full items-center justify-between">
                                          <p className="font-semibold">vAPR:</p>
                                          <p>{(Number(payload[0]?.value?.toString()) / 10 ** 18).toFixed(2)}%</p>
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
                                        ${(USGInfo?.price).toFixed(4)} (USG Price)
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
            </BorderPanel>
          </AccordionItem>
        </Accordion>

        <Divider />
        <USGMarketInfo />
        <TgUsdPositionHistory />
      </div>
    </>
  )
}
