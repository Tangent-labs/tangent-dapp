"use client"

import { formatDollar, formatMillions } from "@/lib/number_formatter"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

type UsgTotalBorrowProps = {
  totalBorrow: Array<{
    timestamp: string
    value: string
  }>
}

export default function UsgTotalBorrow({ totalBorrow }: UsgTotalBorrowProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={totalBorrow}
          margin={{
            top: 10,
            right: -20,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="borrowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(str) =>
              new Date(str).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
              })
            }
          />

          <YAxis
            domain={[0, Number(Math.max(...totalBorrow.map((d) => Number(d?.value)))) * 1.1]}
            orientation="right"
            tickFormatter={(value) => `$${formatMillions(value)}`}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const formattedValue = formatDollar(payload[0]?.value?.toString())
                const formattedDate = new Date(label).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })

                return (
                  <div className="flex flex-col items-center justify-center rounded-[10px] border border-white border-opacity-10 bg-input p-2 text-white backdrop-blur-[60px]">
                    <div className="flex w-full items-center justify-between">
                      <p className="min-w-24 font-semibold">Total Borrow:</p>
                      {formattedValue}
                    </div>
                    <div className="flex w-full items-center justify-between">
                      <p className="min-w-24 font-semibold">Date:</p>
                      {formattedDate}
                    </div>
                  </div>
                )
              }

              return null
            }}
          />
          <Area type="monotone" dataKey="value" stroke="#1568ed" strokeWidth={3} fill="url(#borrowGradient)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
