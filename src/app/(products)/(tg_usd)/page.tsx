import USGMarketList from "@/components/products/tg_usd/list/tg_usd_market_list"
import { USGMaketListProvider } from "@/components/products/tg_usd/list/tg_usd_market_list_context"

export default async function USGMarketPage() {
  return (
    <USGMaketListProvider>
      <USGMarketList />
    </USGMaketListProvider>
  )
}
