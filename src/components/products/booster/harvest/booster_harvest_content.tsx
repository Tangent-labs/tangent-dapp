"use client"

import React from "react"
import { useBoosterHarvestContext } from "./booster_harvest_context"
import HarvestList from "@/components/design_system/advanced/harvest/harvest_list"
import Loader from "@/components/design_system/structure/loader"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"

type BoosterHarvestContextProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default function BoosterHarvestContent({ ...props }: BoosterHarvestContextProps) {
  const { displayRows, actionHarvest, isLoading } = useBoosterHarvestContext()
  const { canInteract } = useWalletConnexionContext()

  if (isLoading) return <Loader />
  return (
    <div className="mt-10">
      <HarvestList {...props} rows={displayRows} onHarvest={actionHarvest} canInteract={canInteract} />
    </div>
  )
}
