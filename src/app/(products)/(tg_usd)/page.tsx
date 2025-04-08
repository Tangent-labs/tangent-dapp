import TgUsdMarketList from "@/components/products/tg_usd/list/tg_usd_market_list"
import { TgUsdMaketListProvider } from "@/components/products/tg_usd/list/tg_usd_market_list_context"
import { TgUsdProvider } from "@/components/products/tg_usd/tg_usd_context"
import React from "react"

export default async function tgUsdMarketPage() {
  return (
    <TgUsdProvider>
      <TgUsdMaketListProvider>
        <TgUsdMarketList />
      </TgUsdMaketListProvider>
    </TgUsdProvider>
  )
}
