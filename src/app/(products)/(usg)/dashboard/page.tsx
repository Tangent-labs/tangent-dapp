import { USGDashboardContent } from "@/components/products/usg/dashboard/dashboard_content"
import { USGDashboardProvider } from "@/components/products/usg/dashboard/dashboard_context"
import { USGMarketListProvider } from "@/components/products/usg/list/usg_market_list_context"

export default async function USGDashboardPage() {
  return (
    <USGMarketListProvider>
      <USGDashboardProvider>
        <USGDashboardContent />
      </USGDashboardProvider>
    </USGMarketListProvider>
  )
}
