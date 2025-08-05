"use client"

import { formatDollar } from "@/lib/number_formatter"
import { useTgUsdRecordContext } from "./tg_usd_record_context"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export default function UsgTotalBorrow() {
  const { totalBorrow } = useTgUsdRecordContext()

  return (
    <div className="flex h-full w-full items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={totalBorrow}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis dataKey="timestamp" tickFormatter={(str) => new Date(str).toLocaleDateString()} />
          <YAxis tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />

          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const formattedValue = `${formatDollar(payload[0]?.value?.toString())}`
                const formattedDate = new Date(label).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })

                return (
                  <div className="flex min-w-40 flex-col items-center justify-center rounded-[10px] border border-white border-opacity-20 bg-input p-2 text-white backdrop-blur-[60px]">
                    <div className="flex w-full items-center justify-between">
                      <p className="font-semibold">Total Borrow:</p>
                      <p>{formattedValue}</p>
                    </div>
                    <div className="flex w-full items-center justify-between">
                      <p className="font-semibold">Date:</p>
                      <p>{formattedDate}</p>
                    </div>
                  </div>
                )
              }

              return null
            }}
          />

          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
