"use client"

import React from "react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Legend } from "recharts"

export default function InterestRateGraph() {
  const data = [
    {
      name: "date 1",
      uv: 1.002,
      pv: 5.22,
    },
    {
      name: "date 2",
      uv: 0.965,
      pv: 5.22,
    },
    {
      name: "date 3",
      uv: 0.85,
      pv: 6.22,
    },
    {
      name: "date 4",
      uv: 0.7,
      pv: 3.22,
    },
    {
      name: "date 5",
      uv: 0.72,
      pv: 1.22,
    },
    {
      name: "date 6",
      uv: 0.8,
      pv: 9.22,
    },
    {
      name: "date 7",
      uv: 0.82,
      pv: 3.22,
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
          <linearGradient id="gradiant-yellow" x1="0" y1="0" x2="0" y2="1">
            <stop offset={0} stopColor="rgba(251, 249, 17, .2)" stopOpacity={1} />
            <stop offset={50} stopColor="rgba(251, 249, 17, 0.05)" stopOpacity={1} />
            <stop offset={100} stopColor="rgba(251, 249, 17, 0.05)" stopOpacity={1} />
          </linearGradient>
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
        <YAxis yAxisId="axis2" className="text-xs" axisLine={false} tickLine={false} orientation="right" />
        <CartesianGrid horizontal={true} vertical={false} stroke="#454545" />
        <Legend />
        <Area type="monotone" dataKey="uv" strokeWidth={2} stroke="#FBF911" fill="url(#gradiant-yellow)" />
        <Area type="step" yAxisId="axis2" dataKey="pv" strokeWidth={2} stroke="#0075FF" fill="url(#gradiant-blue)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
