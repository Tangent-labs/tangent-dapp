"use client"

import HarvestList from "@/components/design_system/advanced/harvest/harvest_list"
import { useUSGHarvestContext } from "./tg_usd_harvest_context"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"

export const USGHarvestContent = () => {
  const { displayRows, actionHarvest } = useUSGHarvestContext()
  const { canInteract } = useWalletConnexionContext()

  return <HarvestList rows={displayRows} onHarvest={actionHarvest} canInteract={canInteract} />
}
