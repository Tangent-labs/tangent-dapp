import { TgUsdDashboardContent } from "@/components/products/tg_usd/dashboard/dashboard_content"
import { TgUsdMaketListProvider } from "@/components/products/tg_usd/list/tg_usd_market_list_context"

export default async function TgUsdDashboardPage() {
  return (
    <TgUsdMaketListProvider>
      <TgUsdDashboardContent />
    </TgUsdMaketListProvider>
  )
}
