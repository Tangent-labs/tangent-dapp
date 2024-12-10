"use client"

import React from "react"
import { useBoosterHarvestContext } from "./booster_harvest_context"
import HarvestList from "@/components/design_system/advanced/harvest/harvest_list"

type BoosterHarvestContextProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default function BoosterHarvestContent({ ...props }: BoosterHarvestContextProps) {
  const { displayRows, actionHarvest } = useBoosterHarvestContext()
  return <HarvestList {...props} rows={displayRows} onHarvest={actionHarvest} />
}
