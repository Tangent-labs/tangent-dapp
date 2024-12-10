import { getBoosterListServerData } from "@/components/products/booster/booster_list/booster_list_controller"
import BoosterHarvestContent from "@/components/products/booster/harvest/booster_harvest_content"
import { BoosterHarvestProvider } from "@/components/products/booster/harvest/booster_harvest_context"
import React from "react"

export default async function BoosterHarvextPage() {
  const { rewardsInfo } = await getBoosterListServerData()
  return (
    <BoosterHarvestProvider rewardsInfo={rewardsInfo}>
      <BoosterHarvestContent />
    </BoosterHarvestProvider>
  )
}
