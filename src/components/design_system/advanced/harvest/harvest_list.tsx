"use client"

import HarvestRow from "./harvest_row"
import { Address } from "viem"
import { HarvesterInfoDisplay } from "@/components/products/tg_usd/tg_usd_type"

type HarverListProps = React.ButtonHTMLAttributes<HTMLDivElement> & {
  rows: HarvesterInfoDisplay[]
  onHarvest: (arg: Address) => void
  canInteract: boolean
}

export default function DeprecatedHarvestList({ rows, canInteract, onHarvest }: HarverListProps) {
  return (
    <div className="mt-12 flex w-full flex-col">
      {rows.map((info, index) => (
        <HarvestRow info={info} key={index} onHarvest={onHarvest} canInteract={canInteract} />
      ))}
    </div>
  )
}
