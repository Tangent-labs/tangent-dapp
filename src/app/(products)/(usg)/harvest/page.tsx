import USGHarvestContent from "@/components/products/usg/harvest/usg_harvest_content"
import { USGHarvestProvider } from "@/components/products/usg/harvest/usg_harvest_context"

export default async function USGHarvestPage() {
  return (
    <USGHarvestProvider>
      <USGHarvestContent />
    </USGHarvestProvider>
  )
}
