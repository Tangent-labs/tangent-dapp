import TgUsdHarvestContent from "@/components/products/tg_usd/harvest/tg_usd_harvest_content"
import { TgUsdHarvestProvider } from "@/components/products/tg_usd/harvest/tg_usd_harvest_context"
import React from "react"

export default async function TgUsdHarvestPage() {
  return (
    <TgUsdHarvestProvider>
      <TgUsdHarvestContent />
    </TgUsdHarvestProvider>
  )
}
