"use client"

import IndicatorCards from "@/components/design_system/structure/indicators_card"
import TokenImage from "@/components/design_system/structure/token_image"
import { formatDollar } from "@/lib/number_formatter"
import { useTgUsdMaketListContext } from "../list/tg_usd_market_list_context"
import { cn } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import Divider from "@/components/design_system/structure/divider"
import { COLORS } from "./dashboard_controller"
import { MarketDebtData, TgUsdCollateralData } from "../tg_usd_type"
import { ExistingAsset } from "@/types"

export const TgUsdDashboardContent = () => {
  const { globalData, userData } = useTgUsdMaketListContext()

  return (
    <div className="flex w-full items-start justify-start gap-3">
      <div className="flex w-1/2 flex-col items-start justify-start">
        <IndicatorCards
          className={cn(globalData.tgUsdPrice === "-" ? "shimmer" : "")}
          indicators={[
            { title: "USG", value: formatDollar(globalData.tgUsdPrice, 5) },
            { title: "Supply", value: globalData.tgUsdSupply },
          ]}
        >
          <TokenImage token="USG" className="h-8 w-8" size={32} />
        </IndicatorCards>

        <div className="mt-3 flex h-full max-h-64 w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
          <div className="text-xl font-semibold">Total Supply </div>
          <Divider className="h-0.5 w-full bg-white/10" />
        </div>

        <div className="mt-3 flex h-full max-h-64 w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
          <div className="text-xl font-semibold">tgUSD collaterals</div>
          <Divider className="h-0.5 w-full bg-white/10" />

          <div className="flex h-[calc(100%-2.5rem)] w-full items-start justify-between">
            <div className="flex w-1/2 items-center justify-center">
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
                      innerRadius={60}
                      cornerRadius={200}
                      outerRadius={66}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {userData?.tgUsdCollateralsData.map((_, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex max-h-48 w-1/2 flex-col items-start justify-start gap-1">
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

        <div className="mt-3 flex h-full max-h-64 w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
          <div className="text-xl font-semibold">Protocol revenues</div>
          <Divider className="h-0.5 w-full bg-white/10" />
          Protocol revenues
        </div>
      </div>
      <div className="flex w-1/2 flex-col items-start justify-start">
        <IndicatorCards
          className={cn(globalData.sgUsdPrice === "-" ? "shimmer" : "")}
          indicators={[
            { title: "sUSG ", value: globalData.sgUsdPrice },
            { title: "Supply", value: globalData.sgUsdSupply },
            { title: "APY", value: globalData.APY },
          ]}
        >
          <TokenImage token="sUSG" className="h-8 w-8" size={32} />
        </IndicatorCards>

        <div className="mt-3 flex h-full max-h-64 w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
          <div className="text-xl font-semibold">Total Supply </div>
          <Divider className="h-0.5 w-full bg-white/10" />
        </div>

        <div className="mt-3 flex h-64 w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
          <div className="text-xl font-semibold">Market debt</div>
          <Divider className="h-0.5 w-full bg-white/10" />
          <div className="mb-2 flex items-center justify-start gap-2 text-xs">
            <div className="text-subtitle">Markets: </div>
            <div className="text-white">{userData?.marketDebtData?.filter((el: MarketDebtData) => el.value > 0).length}</div>
          </div>

          <div className="scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent flex w-full flex-col gap-1 overflow-y-auto">
            {userData?.marketDebtData
              ?.filter((el: MarketDebtData) => el.value > 0)
              .map((data: MarketDebtData) => (
                <div key={data.id} className="flex w-full items-center justify-start">
                  <div className="h-2 w-full rounded-full bg-blue-500" style={{ width: `${data.value}%` }}></div>
                  <div className="ml-2 flex w-fit items-center justify-start gap-2 text-xs">
                    <span className="font-semibold">{data.value}%</span>
                    <span>{data.name}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="mt-3 flex h-full max-h-64 w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
          <div className="text-xl font-semibold">Top performing LPs</div>
          <Divider className="h-0.5 w-full bg-white/10" />
          Top performing LPs
        </div>
      </div>
    </div>
  )
}
