import { USGDashboardContent } from "@/components/products/tg_usd/dashboard/dashboard_content"
import { USGDashboardProvider } from "@/components/products/tg_usd/dashboard/dashboard_context"
import { USGMarketListProvider } from "@/components/products/tg_usd/list/tg_usd_market_list_context"

export default async function USGDashboardPage() {
  return (
    <USGMarketListProvider>
      <USGDashboardProvider>
        <USGDashboardContent />
      </USGDashboardProvider>
    </USGMarketListProvider>
  )
}
