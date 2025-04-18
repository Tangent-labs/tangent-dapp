import TgUsdMarketList from "@/components/products/tg_usd/list/tg_usd_market_list"
import { TgUsdMaketListProvider } from "@/components/products/tg_usd/list/tg_usd_market_list_context"

export default async function tgUsdMarketPage() {
  return (
    <TgUsdMaketListProvider>
      <TgUsdMarketList />
    </TgUsdMaketListProvider>
  )
}
