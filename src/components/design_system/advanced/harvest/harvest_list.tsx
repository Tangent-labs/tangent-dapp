"use client"

import { HarvesterInfoDisplay } from "@/components/products/booster/booster_type"
import React from "react"
import HarvestRow from "./harvest_row"
import { Address } from "viem"

type HarverListProps = React.ButtonHTMLAttributes<HTMLDivElement> & {
  rows: HarvesterInfoDisplay[]
  onHarvest: (arg: Address) => void
}

export default function HarvestList({ rows, onHarvest, ...props }: HarverListProps) {
  return (
    <div {...props}>
      {rows.map((info, index) => (
        <HarvestRow info={info} key={index} onHarvest={onHarvest} />
      ))}
    </div>
  )
}
