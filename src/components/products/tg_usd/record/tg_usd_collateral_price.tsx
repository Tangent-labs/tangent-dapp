"use client"

import ButtonTab from "@/components/design_system/inputs/button_tab"
import Divider from "@/components/design_system/structure/divider"
import Title from "@/components/design_system/structure/title"
import TokenImage from "@/components/design_system/structure/token_image"

import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts"
import { useTgUsdRecordContext } from "./tg_usd_record_context"

const CollateralGraph = () => {
  const data = [
    {
      name: "date 1",
      uv: 1.002,
    },
    {
      name: "date 2",
      uv: 0.965,
    },
    {
      name: "date 3",
      uv: 0.975,
    },
    {
      name: "date 4",
      uv: 0.995,
    },
    {
      name: "date 5",
      uv: 0.997,
    },
    {
      name: "date 6",
      uv: 0.9999,
    },
    {
      name: "date 7",
      uv: 1.0245,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        className=""
        width={500}
        height={400}
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="gradiant" x1="0" y1="0" x2="0" y2="1">
            <stop offset={0} stopColor="rgba(251, 249, 17, .2)" stopOpacity={1} />
            <stop offset={50} stopColor="rgba(251, 249, 17, 0.05)" stopOpacity={1} />
            <stop offset={100} stopColor="rgba(251, 249, 17, 0.05)" stopOpacity={1} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" className="text-xs" axisLine={false} tickLine={false} />
        <YAxis className="text-xs" axisLine={false} tickLine={false} />
        <ReferenceLine y={0.9} stroke="#FF0300" strokeDasharray="3 3" label={{ position: "insideTopRight", value: "Liquidation price", fontSize: 14 }} />
        <Area strokeWidth={2} type="monotone" dataKey="uv" stroke="#FBF911" fill="url(#gradiant)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default function TgUsdCollateralPrice() {
  const { collateralInfo } = useTgUsdRecordContext()
  return (
    <div className="flex w-full flex-col justify-between rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
      <Title label="Collateral price" size={"normal"} />
      <Divider />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-1">
          <TokenImage token={collateralInfo?.logo} size={32} />
          <span>{collateralInfo.symbol}</span>
        </div>
        <div>
          <div className="flex gap-2">
            <ButtonTab label={"5m"} active={true} className="rounded-full !py-1" />
            <ButtonTab label={"15m"} active={false} className="rounded-full !py-1" />
            <ButtonTab label={"1h"} active={false} className="rounded-full !py-1" />
            <ButtonTab label={"4h"} active={false} className="rounded-full !py-1" />
            <ButtonTab label={"1d"} active={false} className="rounded-full !py-1" />
            <ButtonTab label={"1w"} active={false} className="rounded-full !py-1" />
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <CollateralGraph />
      </div>
    </div>
  )
}
