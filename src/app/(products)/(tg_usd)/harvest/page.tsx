import USGHarvestContent from "@/components/products/tg_usd/harvest/tg_usd_harvest_content"
import { USGHarvestProvider } from "@/components/products/tg_usd/harvest/tg_usd_harvest_context"

export default async function USGHarvestPage() {
  return (
    <USGHarvestProvider>
      <USGHarvestContent />
    </USGHarvestProvider>
  )
}
