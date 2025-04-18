import TgUsdHarvestContent from "@/components/products/tg_usd/harvest/tg_usd_harvest_content"
import { TgUsdHarvestProvider } from "@/components/products/tg_usd/harvest/tg_usd_harvest_context"

export default async function TgUsdHarvestPage() {
  return (
    <TgUsdHarvestProvider>
      <TgUsdHarvestContent />
    </TgUsdHarvestProvider>
  )
}
