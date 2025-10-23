"use client"

import { cn } from "@/lib/utils"
import { ExistingAsset } from "@/types"
import { formatDollar } from "@/lib/number_formatter"
import { useRootContext } from "../../root/root_context"
import { useUSGDashboardContext } from "./dashboard_context"
import Divider from "@/components/design_system/structure/divider"
import { MarketDebtData, TgUsdCollateralData } from "../tg_usd_type"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import TokenImage from "@/components/design_system/structure/token_image"
import { ValueType } from "recharts/types/component/DefaultTooltipContent"
import IndicatorCards from "@/components/design_system/structure/indicators_card"
import { mockBarChartData, COLORS, formatXAxis, formatYAxis } from "./dashboard_controller"
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Area, AreaChart, Tooltip } from "recharts"

export const USGDashboardContent = () => {
  const { globalData, userData } = useUSGDashboardContext()

  const { totalSupplies, sUSGSelectedTab, USGSelectedTab, fetchUSGTotalSupplyData, fetchsUSGTotalSupplyData, sUSGCurrentAPY } = useRootContext()

  const maxUv = Math.max(...mockBarChartData.map((item) => item.uv))

  const CustomTooltip = (props: {
    active?: boolean | undefined
    payload?: Array<{ dataKey?: string | number | undefined; value?: ValueType | undefined }> | undefined
    label?: number
  }) => {
    const date = new Date(props?.label as number)

    const value = Number(props?.payload ? props?.payload[0]?.value : 0)

    return (
      <div className="pointer-events-none rounded-xl bg-[#070707] px-3 py-2 text-[10px]">
        <div className="flex gap-1">
          <div className="text-subtitle">Date : </div>
          <div className="font-bold text-white">{date.toDateString()}</div>
        </div>
        <div className="flex gap-1">
          <div className="text-subtitle">Total Supply :</div>
          <div className="font-bold text-white"> {formatDollar(value, 0)}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-start justify-start gap-2">
      <div className="mb-2 flex h-full w-full flex-col items-start justify-start gap-8 rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <div
          style={{ fontSize: "20px", lineHeight: "20px" }}
          className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/pointsCampaign.png')] bg-[position:calc(100%+40px)_center] bg-no-repeat px-6 !font-semibold italic"
        >
          Points campaign
          <div className="ml-6 flex items-center justify-center rounded-[10px] bg-tonic px-6 py-0.5 font-semibold not-italic text-black">Live</div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:justify-start">
        <IndicatorCards
          className={cn(globalData.USGPrice === "-" ? "shimmer" : "", "flex w-full items-center justify-around")}
          indicators={[
            { title: "USG", value: formatDollar(globalData.USGPrice, 5) },
            { title: "Supply", value: globalData.USGSupply },
          ]}
        >
          <TokenImage token="USG" className="h-8 w-8" size={32} />
        </IndicatorCards>

        <IndicatorCards
          className={cn(globalData.sUSGPrice === "-" ? "shimmer" : "", "flex w-full items-center justify-around")}
          indicators={[
            { title: "sUSG ", value: globalData.sUSGPrice },
            { title: "Supply", value: globalData.sUSGSupply },
            { title: "APY", value: `${sUSGCurrentAPY}%` },
          ]}
        >
          <TokenImage token="sUSG" className="h-8 w-8" size={32} />
        </IndicatorCards>
      </div>

      <div className="flex w-full flex-col items-start justify-start gap-4 md:flex-row">
        <div className="flex w-full items-start justify-start md:w-1/2">
          <div className="mt-1 flex h-full max-h-72 w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel p-3 backdrop-blur">
            <div className="text-xl font-semibold">Total Supply </div>
            <Divider className="h-0.5 w-full bg-white/10" />

            <div className="mb-2 flex w-full items-center justify-between">
              <div className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-3 py-1">
                <TokenImage token="USG" size={20} />
                USG
              </div>

              <div className="flex gap-2">
                <ButtonTab onClick={() => fetchUSGTotalSupplyData("1w")} label={"1w"} active={USGSelectedTab === "1w"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchUSGTotalSupplyData("1m")} label={"1m"} active={USGSelectedTab === "1m"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchUSGTotalSupplyData("3m")} label={"3m"} active={USGSelectedTab === "3m"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchUSGTotalSupplyData("1y")} label={"1y"} active={USGSelectedTab === "1y"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchUSGTotalSupplyData("all")} label={"all"} active={USGSelectedTab === "all"} className="rounded-full !py-1" />
              </div>
            </div>

            <div className="mb-8 flex h-48 min-h-48 w-full items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  width={500}
                  height={400}
                  data={totalSupplies.USGTotalSupply}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 20,
                    bottom: 10,
                  }}
                >
                  <defs>
                    <linearGradient id="gradientFill1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0075FF" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#0075FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tickFormatter={formatXAxis} scale="point" padding={{ left: 10, right: 10 }} />
                  <YAxis tickFormatter={formatYAxis} domain={[0, maxUv * 1.2]} />
                  <Area type="monotone" dataKey="uv" stroke="#00C2FF" fill="url(#gradientFill1)" />

                  <Tooltip
                    cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 2 }}
                    allowEscapeViewBox={{ x: false, y: false }}
                    content={<CustomTooltip />}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="flex w-full items-start justify-start md:w-1/2">
          <div className="mt-1 flex h-full max-h-72 w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
            <div className="text-xl font-semibold">Total Supply </div>
            <Divider className="h-0.5 w-full bg-white/10" />

            <div className="mb-2 flex w-full items-center justify-between">
              <div className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-3 py-1">
                <TokenImage token="sUSG" size={20} />
                sUSG
              </div>

              <div className="flex gap-2">
                <ButtonTab onClick={() => fetchsUSGTotalSupplyData("1w")} label={"1w"} active={sUSGSelectedTab === "1w"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchsUSGTotalSupplyData("1m")} label={"1m"} active={sUSGSelectedTab === "1m"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchsUSGTotalSupplyData("3m")} label={"3m"} active={sUSGSelectedTab === "3m"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchsUSGTotalSupplyData("1y")} label={"1y"} active={sUSGSelectedTab === "1y"} className="rounded-full !py-1" />
                <ButtonTab onClick={() => fetchsUSGTotalSupplyData("all")} label={"all"} active={sUSGSelectedTab === "all"} className="rounded-full !py-1" />
              </div>
            </div>

            <div className="mb-8 flex h-48 min-h-48 w-full items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  width={500}
                  height={400}
                  data={totalSupplies.sUSGTotalSupply}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 20,
                    bottom: 10,
                  }}
                >
                  <defs>
                    <linearGradient id="gradientFill1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0075FF" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#0075FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tickFormatter={formatXAxis} scale="point" padding={{ left: 10, right: 10 }} />
                  <YAxis tickFormatter={formatYAxis} domain={[0, maxUv * 1.2]} />

                  <Area type="monotone" dataKey="uv" stroke="#00C2FF" fill="url(#gradientFill1)" />
                  <Tooltip
                    cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 2 }}
                    allowEscapeViewBox={{ x: false, y: false }}
                    content={<CustomTooltip />}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-start justify-start gap-4 md:flex-row">
        <div className="flex w-full items-start justify-start md:w-1/2">
          <div className="mt-3 flex h-full max-h-64 w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
            <div className="text-xl font-semibold">USG collaterals</div>
            <Divider className="h-0.5 w-full bg-white/10" />

            <div className="flex h-[calc(100%-2.5rem)] w-full items-start justify-between">
              <div className="mt-6 flex w-full items-center justify-center sm:w-6/12 md:w-full xl:w-6/12">
                <div className="relative flex h-48 w-full items-center justify-center">
                  <div className="absolute left-0 top-0 flex h-48 w-full">
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                      <div className="mt-4 text-xs text-subtitle">Collaterals</div>
                      <div className="text-[40px] font-semibold text-white">
                        {userData?.tgUsdCollateralsData.filter((el: TgUsdCollateralData) => el.value > 0)?.length}
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userData?.tgUsdCollateralsData}
                        cx="50%"
                        cy="50%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={80}
                        cornerRadius={200}
                        outerRadius={88}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                      >
                        {userData?.tgUsdCollateralsData.map((_, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="hidden max-h-48 w-full flex-col items-start justify-start gap-1 sm:flex sm:w-6/12 md:hidden xl:flex xl:w-6/12">
                <div className="scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent my-4 flex max-h-full w-full flex-col gap-1 overflow-y-auto">
                  {userData?.tgUsdCollateralsData
                    .filter((el: TgUsdCollateralData) => el.value > 0)
                    .sort((a: TgUsdCollateralData, b: TgUsdCollateralData) => (a.value > b.value ? -1 : 1))
                    .map((el: TgUsdCollateralData, index: number) => (
                      <div key={el.name} className="mb-1 flex w-full items-center justify-start gap-2 rounded-[10px] px-3 py-1 backdrop-blur-[60px]">
                        <div className="h-1 w-1 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <TokenImage token={el.name as ExistingAsset} size={16} className="w-7" />
                        <div className="text-subtitle">{el.name}</div>
                        <div>-</div>
                        <div className="font-semibold text-white">{el.value}%</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full items-start justify-start md:w-1/2">
          <div className="mt-3 flex h-64 w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
            <div className="text-xl font-semibold">Market debt</div>
            <Divider className="h-0.5 w-full bg-white/10" />
            <div className="mb-2 flex items-center justify-start gap-2 text-xs">
              <div className="text-subtitle">Markets: </div>
              <div className="text-white">{userData?.marketDebtData?.filter((el: MarketDebtData) => el.value > 0).length}</div>
            </div>

            <div className="scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent flex w-full flex-col gap-1 overflow-y-auto">
              {(() => {
                const maxValue = Math.max(
                  ...(userData?.marketDebtData?.filter((el: MarketDebtData) => el.value > 0).map((el: MarketDebtData) => el.value) || [1])
                )

                return userData?.marketDebtData
                  ?.filter((el: MarketDebtData) => el.value > 0)
                  .map((data: MarketDebtData) => (
                    <div key={data.id} className="flex w-full items-center justify-start gap-2">
                      <div className="h-2 flex-grow rounded-full bg-blue-500" style={{ maxWidth: `${(data.value / (maxValue + 20)) * 100}%` }}></div>
                      <div className="flex min-w-[120px] flex-shrink-0 items-center justify-start gap-1 text-xs">
                        <span className="font-semibold">{data.value}%</span>
                        <span>{data.name}</span>
                      </div>
                    </div>
                  ))
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-start justify-start gap-4 md:flex-row">
        {/* <div className="flex w-full items-start justify-start md:w-1/2">
          <div className="mt-3 flex h-full max-h-64 w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
            <div className="text-xl font-semibold">Protocol revenues</div>
            <Divider className="h-0.5 w-full bg-white/10" />

            <div className="mb-8 flex h-48 min-h-48 w-full items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockBarChartData} margin={{ top: 15, right: 30, left: 20, bottom: 8 }} barSize={10}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatXAxis}
                    scale="point"
                    padding={{ left: 10, right: 10 }}
                    label={{ value: "Week", position: "insideBottomRight", offset: -5 }}
                  />
                  <YAxis tickFormatter={formatYAxis} label={{ value: "Revenue (k$)", angle: -90, position: "insideLeft" }} domain={[0, maxUv * 1.2]} />
                  <Tooltip
                    formatter={(value) => [`${(Number(value) / 1000).toFixed(2)}k$`, "Revenue"]}
                    labelFormatter={(label) => `Week of ${formatXAxis(label)}`}
                  />
                  <Bar dataKey="uv" fill="#0075FF" radius={[50, 50, 0, 0]} background={{ fill: "#eee", opacity: 0.1, radius: 50 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div> */}

        <div className="flex w-full items-start justify-start md:w-1/2">
          {/* <div className="mt-3 flex h-full min-h-64 w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
            <div className="text-xl font-semibold">Top performing LPs</div>
            <Divider className="h-0.5 w-full bg-white/10" />

            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <div
                style={{ borderWidth: 1.5 }}
                onClick={() => window.open("https://youtu.be/5Hplx-geZHo?t=5")}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-[10px] border-white border-opacity-20 px-4 py-2 hover:border-none hover:bg-top-performing-lps"
              >
                <span>
                  <TokenImage token={"crvUSD-USDC"} size={24} />
                </span>
                <span>crvUSD-USDC</span>
                <div className="rounded-[10px] bg-overlay-panel px-2 py-1 font-semibold backdrop-blur-[60px]">60%</div>
                <div className="mt-2 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]">
                  <IconArrow className="w-3"></IconArrow>
                </div>
              </div>
              <div
                style={{ borderWidth: 1.5 }}
                onClick={() => window.open("https://youtu.be/5Hplx-geZHo?t=5")}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-[10px] border-white border-opacity-20 px-4 py-2 hover:border-none hover:bg-top-performing-lps"
              >
                <span>
                  <TokenImage token={"crvUSD-USDT"} size={24} />
                </span>
                <span>crvUSD-USDT</span>
                <div className="rounded-[10px] bg-overlay-panel px-2 py-1 font-semibold backdrop-blur-[60px]">60%</div>
                <div className="mt-2 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]">
                  <IconArrow className="w-3"></IconArrow>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}
