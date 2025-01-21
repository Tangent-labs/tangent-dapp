"use client"

import React from "react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Legend } from "recharts"

export default function BorrowHistoryGraph() {
  const data = Array.from({ length: 7 }, (_, i) => ({
    name: `date ${i + 1}`,
    uv: (1 + (Math.random() - 0.7) * 0.5).toFixed(4), // Central value around 1, variability ±0.05
  }))

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
          <linearGradient id="gradiant-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset={0} stopColor="rgba(0,117,255, .2)" stopOpacity={1} />
            <stop offset={50} stopColor="rgba(0,117,255, 0.05)" stopOpacity={1} />
            <stop offset={100} stopColor="rgba(0,117,255, 0.05)" stopOpacity={1} />
          </linearGradient>
          border: 2px solid;
          {/* border-image-source: linear-gradient(315.15deg, #FBF911 0.08%, #99FF00 100%); */}
        </defs>
        <XAxis dataKey="name" className="text-xs" axisLine={false} tickLine={false} />
        <YAxis className="text-xs" axisLine={false} tickLine={false} />

        <CartesianGrid horizontal={true} vertical={false} stroke="#454545" />
        <Legend />
        <Area type="monotone" strokeWidth={2} dataKey="uv" stroke="#0075FF" fill="url(#gradiant-blue)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/*
background: linear-gradient(180deg, rgba(0, 117, 255, 0.3) 0%, rgba(0, 117, 255, 0) 100%);

*/
