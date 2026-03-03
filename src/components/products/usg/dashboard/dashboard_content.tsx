"use client"

import { cn } from "@/lib/utils"
import { returnTVLType } from "./utils"
import { MarketDebt } from "./market_debt"
import { USGCollaterals } from "./usg_collaterals"
import { useUSGDashboardContext } from "./dashboard_context"
import { formatXAxis, formatYAxis } from "./dashboard_controller"
import { Divider } from "@/components/design_system/structure/divider"
import { ButtonTab } from "@/components/design_system/inputs/button_tab"
import { formatCompact, formatDollar } from "@/lib/number_formatter"
import { useRootContext } from "@/components/products/root/root_context"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import IndicatorCards from "@/components/design_system/structure/indicators_card"
import { ResponsiveContainer, XAxis, YAxis, Area, AreaChart, Tooltip, TooltipProps } from "recharts"

export const USGDashboardContent = () => {
  const { globalData, userData, marketDebtMaxValue, marketTVLMaxValue } = useUSGDashboardContext()

  const {
    tvl,
    protocolCurrentTVL,
    sUSGCurrentAPY,
    tvlSelectedTab,
    USGCurrentSupply,
    sUSGCurrentSupply,
    totalSupplySelectedTab,
    USGsUSGTotalSupplyData,
    fetchTVLData,
    fetchTotalSupplyData,
  } = useRootContext()

  type PayloadItem = {
    dataKey?: string
    value?: number
    payload?: { date?: number | undefined }
  }

  const CustomTVLTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) return null

    const marketsItem = payload.find((p) => p.dataKey === "markets")
    const wtsItem = payload.find((p) => p.dataKey === "wts")
    const pegKeepersItem = payload.find((p) => p.dataKey === "pegkeepers")
    const susgItem = payload.find((p) => p.dataKey === "susg")

    const m = (marketsItem?.value as number) ?? 0
    const wts = (wtsItem?.value as number) ?? 0
    const pk = (pegKeepersItem?.value as number) ?? 0
    const susg = (susgItem?.value as number) ?? 0

    const total = m + wts + pk + susg

    const ts = marketsItem?.payload?.date as number
    const dateLabel = new Date(ts).toDateString()

    return (
      <div className="flex min-w-40 flex-col items-start justify-center gap-1 rounded-[10px] border border-white border-opacity-20 bg-input p-3 backdrop-blur-[60px]">
        <div className="mb-3 text-xs font-medium text-slate-300">{dateLabel}</div>

        <div className="mb-2 flex w-full items-center justify-between text-xs">
          <span className="font-semibold text-white"> Total </span>
          <span className="font-semibold text-white">${formatCompact(total)}</span>
        </div>

        <div className="flex w-full items-center justify-between text-xs">
          <span className="text-row-tonic">Markets</span>
          <span className="text-white">${formatCompact(m)}</span>
        </div>

        <div className="flex w-full items-center justify-between text-xs">
          <span className="text-dash-wts">WTS</span>
          <span className="text-white">${formatCompact(wts)}</span>
        </div>

        <div className="flex w-full items-center justify-between text-xs">
          <span className="text-dash-keepers">Peg Keepers</span>
          <span className="text-white">${formatCompact(pk)}</span>
        </div>

        <div className="flex w-full items-center justify-between text-xs">
          <span className="text-dash-susg">sUSG</span>
          <span className="text-white">${formatCompact(susg)}</span>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) return null

    const usgItem = payload.find((p) => p.dataKey === "usg") as PayloadItem | undefined
    const susgItem = payload.find((p) => p.dataKey === "susg") as PayloadItem | undefined

    const usg = (usgItem?.value as number) ?? 0
    const susg = (susgItem?.value as number) ?? 0
    const total = usg + susg

    const ts = (usgItem?.payload?.date ?? susgItem?.payload?.date) as number
    const dateLabel = new Date(ts).toDateString()

    return (
      <div className="min-w-32 rounded-[10px] border border-white border-opacity-20 bg-input p-3 backdrop-blur-[60px]">
        <div className="mb-3 text-xs font-medium text-slate-300">{dateLabel}</div>

        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-white"> Total </span>
          <span className="font-semibold text-white">${formatCompact(total)}</span>
        </div>

        <div className="mb-1 flex items-center justify-between gap-2 text-xs">
          <span className="bg-tab bg-clip-text text-transparent">USG</span>
          <span className="text-white">${formatCompact(usg)}</span>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="bg-tonic bg-clip-text text-transparent">sUSG</span>
          <span className="text-white">${formatCompact(susg)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-start justify-start gap-3">
      <div className="flex h-full w-full flex-col items-start justify-start gap-8 rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <ReliefCard className="w-full">
          <div
            style={{ fontSize: "20px", lineHeight: "20px" }}
            className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/fulltan.png')] bg-[size:30%] bg-[position:calc(100%)_bottom] bg-no-repeat px-6 !font-semibold italic"
          >
            Points campaign
            <div className="ml-6 flex items-center justify-center rounded-[10px] bg-tonic px-6 py-0.5 font-semibold not-italic text-black">Live</div>
          </div>
        </ReliefCard>
      </div>

      <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:justify-start">
        <IndicatorCards
          className={cn(globalData.USGPrice === "-" ? "shimmer" : "", "flex w-full items-center justify-around")}
          indicators={[
            { title: "USG", value: formatDollar(globalData.USGPrice, 4) },
            { title: "Supply", value: globalData.USGSupply },
          ]}
        >
          <TokenImage token="USG" className="h-8 w-8" size={32} />
        </IndicatorCards>

        <IndicatorCards
          className={cn(globalData.sUSGPrice === "-" ? "shimmer" : "", "flex w-full items-center justify-around")}
          indicators={[
            { title: "sUSG ", value: formatDollar(globalData.sUSGPrice, 4) },
            { title: "Supply", value: globalData.sUSGSupply },
            { title: "APY", value: sUSGCurrentAPY.toFixed(2) + "%" },
          ]}
        >
          <TokenImage token="sUSG" className="h-8 w-8" size={32} />
        </IndicatorCards>
      </div>

      <div className="flex w-full flex-col items-start justify-start gap-3 md:flex-row">
        <div className="flex w-full items-start justify-start">
          <ReliefCard className="flex h-full max-h-[340px] w-full flex-col items-start justify-start p-3">
            <div className="flex w-full items-center justify-end sm:justify-between">
              <div className="hidden text-xl font-semibold sm:flex">Total Supply </div>

              <div className="flex gap-2">
                <ButtonTab onClick={() => fetchTotalSupplyData("1w")} label={"1w"} active={totalSupplySelectedTab === "1w"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchTotalSupplyData("1m")} label={"1m"} active={totalSupplySelectedTab === "1m"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchTotalSupplyData("3m")} label={"3m"} active={totalSupplySelectedTab === "3m"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchTotalSupplyData("1y")} label={"1y"} active={totalSupplySelectedTab === "1y"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchTotalSupplyData("all")} label={"all"} active={totalSupplySelectedTab === "all"} className="rounded-full !py-1" />
              </div>
            </div>

            <Divider className="h-0.5 w-full bg-white/10" />

            <div className="flex w-full items-stretch justify-start gap-2 text-xs">
              <div className="flex flex-row items-start justify-start gap-2 self-stretch rounded-[10px] bg-overlay-panel p-2 md:flex-col">
                <div className="flex text-xs text-subtitle sm:hidden">Total supply </div>
                <div className="hidden text-xs text-subtitle sm:flex">Total </div>

                <div className="text-xs font-semibold text-white"> {formatDollar(sUSGCurrentSupply + USGCurrentSupply, 0)}</div>
              </div>

              {USGCurrentSupply > 0 && (
                <div className="hidden flex-col items-center gap-2 rounded-[10px] bg-overlay-panel p-2 md:flex">
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex h-2 w-2 rounded-full bg-button-active"></div>

                    <div className="flex items-center justify-center gap-1">
                      <TokenImage token="USG" size={16} />
                      USG
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between gap-2 font-semibold">
                    <span>{formatCompact(USGCurrentSupply)}</span>
                    <span className="h-1 w-1 rounded-full bg-white"></span>
                    <span>{((USGCurrentSupply / (sUSGCurrentSupply + USGCurrentSupply)) * 100).toFixed(2)}%</span>
                  </div>
                </div>
              )}

              {sUSGCurrentSupply > 0 && (
                <div className="hidden flex-col items-center gap-2 rounded-[10px] bg-overlay-panel p-2 md:flex">
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex h-2 w-2 rounded-full bg-tonic"></div>

                    <div className="flex items-center justify-center gap-1">
                      <TokenImage token="sUSG" size={16} />
                      sUSG
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between gap-2 font-semibold">
                    <span>{formatCompact(sUSGCurrentSupply)}</span>
                    <span className="h-1 w-1 rounded-full bg-white"></span>
                    <span>{((sUSGCurrentSupply / (sUSGCurrentSupply + USGCurrentSupply)) * 100).toFixed(2)}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8 flex h-56 min-h-56 w-full items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  width={500}
                  height={400}
                  data={USGsUSGTotalSupplyData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 20,
                    bottom: 10,
                  }}
                >
                  <defs>
                    <linearGradient id="susgGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(252, 248, 47, 0.3)" />
                      <stop offset="100%" stopColor="rgba(251, 249, 17, 0)" />
                    </linearGradient>

                    <linearGradient id="usgGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(0, 117, 255, 0.3)" />
                      <stop offset="100%" stopColor="rgba(0, 117, 255, 0)" />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="date" tickFormatter={formatXAxis} scale="point" padding={{ left: 10, right: 10 }} />

                  <YAxis tickFormatter={formatYAxis} />

                  <Area
                    strokeWidth={2}
                    type="monotone"
                    dataKey="susg"
                    stroke="rgba(251, 249, 17, 0.8)"
                    fill="url(#susgGradient)"
                    name="sUSG Total Supply"
                    connectNulls
                  />

                  <Area
                    strokeWidth={2}
                    type="monotone"
                    dataKey="usg"
                    stroke="rgba(0, 117, 255, 0.8)"
                    fill="url(#usgGradient)"
                    name="USG Total Supply"
                    connectNulls
                  />

                  <Tooltip
                    cursor={{
                      stroke: "rgba(255,255,255,0.7)",
                      strokeWidth: 2,
                      strokeDasharray: "4 4",
                    }}
                    allowEscapeViewBox={{ x: false, y: false }}
                    content={<CustomTooltip />}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ReliefCard>
        </div>
      </div>

      <div className="flex w-full flex-col items-start justify-start gap-3 md:flex-row">
        <div className="flex w-full items-start justify-start">
          <ReliefCard className="flex h-full max-h-[340px] w-full flex-col items-start justify-start p-3">
            <div className="flex w-full items-center justify-end sm:justify-between">
              <div className="hidden text-xl font-semibold sm:flex">TVL </div>

              <div className="flex gap-2">
                <ButtonTab onClick={() => fetchTVLData("1w")} label={"1w"} active={tvlSelectedTab === "1w"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchTVLData("1m")} label={"1m"} active={tvlSelectedTab === "1m"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchTVLData("3m")} label={"3m"} active={tvlSelectedTab === "3m"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchTVLData("1y")} label={"1y"} active={tvlSelectedTab === "1y"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchTVLData("all")} label={"all"} active={tvlSelectedTab === "all"} className="rounded-full !py-1" />
              </div>
            </div>

            <Divider className="h-0.5 w-full bg-white/10" />

            {protocolCurrentTVL && protocolCurrentTVL?.total > 0 && (
              <div className="flex w-full items-stretch justify-start gap-2 text-xs">
                <div className="flex flex-row items-start justify-start gap-2 self-stretch rounded-[10px] bg-overlay-panel p-2 md:flex-col">
                  <div className="flex text-xs text-subtitle">TVL </div>

                  <div className="text-xs font-semibold text-white"> {formatDollar(protocolCurrentTVL?.total, 0)}</div>
                </div>

                {[
                  { label: "Markets", name: "markets" },
                  { label: "WTS", name: "wts" },
                  { label: "Peg Keepers", name: "pegkeepers" },
                  { label: "sUSG", name: "susg" },
                ].map((el) => (
                  <div key={el?.name} className="hidden flex-col items-center gap-2 rounded-[10px] bg-overlay-panel p-2 md:flex">
                    <div className="flex w-full items-center justify-between gap-2">
                      <div className={cn("flex h-2 w-2 rounded-full", returnTVLType(el?.name))}></div>
                      <div className="flex items-center justify-center gap-1">{el?.label}</div>
                    </div>

                    <div className="flex w-full items-center justify-between gap-2 font-semibold">
                      {formatCompact(protocolCurrentTVL[el?.name as keyof typeof protocolCurrentTVL])}
                      <span className="h-1 w-1 rounded-full bg-white"></span>
                      <span>{((protocolCurrentTVL[el?.name as keyof typeof protocolCurrentTVL] / protocolCurrentTVL?.total) * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-8 flex h-56 min-h-56 w-full items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  width={500}
                  height={400}
                  data={tvl}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 20,
                    bottom: 10,
                  }}
                >
                  <defs>
                    <linearGradient id="marketsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0075ff" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#0075ff" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient id="pegKeepersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#24DD9A" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#24DD9A" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient id="wtsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#95FF00" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#95FF00" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient id="susgGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4EB3DF" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#4EB3DF" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="date" tickFormatter={formatXAxis} scale="point" padding={{ left: 10, right: 10 }} />

                  <YAxis tickFormatter={formatYAxis} />

                  <Area type="monotone" dataKey="susg" stackId="1" stroke="#4EB3DF" strokeWidth={1.5} fill="url(#susgGradient)" name="SUSG" connectNulls />

                  <Area
                    type="monotone"
                    dataKey="pegkeepers"
                    stackId="1"
                    stroke="#24DD9A"
                    strokeWidth={1.5}
                    fill="url(#pegKeepersGradient)"
                    name="Peg Keepers"
                    connectNulls
                  />

                  <Area type="monotone" dataKey="wts" stackId="1" stroke="#95FF00" strokeWidth={1.5} fill="url(#wtsGradient)" name="WTS" connectNulls />

                  <Area
                    type="monotone"
                    dataKey="markets"
                    stackId="1"
                    stroke="#0075ff"
                    strokeWidth={1.5}
                    fill="url(#marketsGradient)"
                    name="Markets"
                    connectNulls
                  />

                  <Tooltip
                    cursor={{
                      stroke: "rgba(255,255,255,0.7)",
                      strokeWidth: 2,
                      strokeDasharray: "4 4",
                    }}
                    allowEscapeViewBox={{ x: false, y: false }}
                    content={<CustomTVLTooltip />}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ReliefCard>
        </div>
      </div>

      <div className="flex w-full flex-col items-start justify-start gap-3 md:flex-row">
        {userData && (
          <>
            <USGCollaterals userData={userData} marketTVLMaxValue={marketTVLMaxValue} />

            <MarketDebt userData={userData} marketDebtMaxValue={marketDebtMaxValue} />
          </>
        )}
      </div>
    </div>
  )
}
