import USGMarketList from "@/components/products/tg_usd/list/tg_usd_market_list"
import { USGMarketListProvider } from "@/components/products/tg_usd/list/tg_usd_market_list_context"

export default async function USGMarketPage() {
  return (
    <USGMarketListProvider>
      <USGMarketList />
    </USGMarketListProvider>
  )
}
