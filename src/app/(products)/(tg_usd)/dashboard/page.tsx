import { USGDashboardContent } from "@/components/products/tg_usd/dashboard/dashboard_content"
import { USGDashboardProvider } from "@/components/products/tg_usd/dashboard/dashboard_context"
import { USGMaketListProvider } from "@/components/products/tg_usd/list/tg_usd_market_list_context"

export default async function USGDashboardPage() {
  return (
    <USGMaketListProvider>
      <USGDashboardProvider>
        <USGDashboardContent />
      </USGDashboardProvider>
    </USGMaketListProvider>
  )
}
