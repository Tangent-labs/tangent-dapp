import ProductPageHeader from "@/components/products/product_nav/product_page_header"
import TgUsdMarketList from "@/components/products/tg_usd/list/tg_usd_market_list"
import { TgUsdMaketListProvider } from "@/components/products/tg_usd/list/tg_usd_market_list_context"
import { TgUsdProvider } from "@/components/products/tg_usd/tg_usd_context"
import React from "react"

export default async function tgUsdMarketPage() {
  // get price for asset here

  return (
    <TgUsdProvider>
      <TgUsdMaketListProvider>
        <ProductPageHeader />
        <TgUsdMarketList />
      </TgUsdMaketListProvider>
    </TgUsdProvider>
  )
}
