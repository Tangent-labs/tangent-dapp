"use client"

import HarvestRow from "./harvest_row"
import { Address } from "viem"
import { HarvesterInfoDisplay } from "@/components/products/tg_usd/tg_usd_type"

type HarverListProps = React.ButtonHTMLAttributes<HTMLDivElement> & {
  rows: HarvesterInfoDisplay[]
  onHarvest: (arg: Address) => void
  canInteract: boolean
}

export default function HarvestList({ rows, canInteract, onHarvest, ...props }: HarverListProps) {
  return (
    <div {...props}>
      {rows.map((info, index) => (
        <HarvestRow info={info} key={index} onHarvest={onHarvest} canInteract={canInteract} />
      ))}
    </div>
  )
}
