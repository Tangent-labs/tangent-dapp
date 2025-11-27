import USGMarketList from "@/components/products/usg/list/usg_market_list"
import { USGMarketListProvider } from "@/components/products/usg/list/usg_market_list_context"

export default async function USGMarketPage() {
  return (
    <USGMarketListProvider>
      <USGMarketList />
    </USGMarketListProvider>
  )
}
