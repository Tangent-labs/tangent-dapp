import { USGDashboardContent } from "@/components/products/tg_usd/dashboard/dashboard_content"
import { USGMaketListProvider } from "@/components/products/tg_usd/list/tg_usd_market_list_context"

export default async function USGDashboardPage() {
  return (
    <USGMaketListProvider>
      <USGDashboardContent />
    </USGMaketListProvider>
  )
}
