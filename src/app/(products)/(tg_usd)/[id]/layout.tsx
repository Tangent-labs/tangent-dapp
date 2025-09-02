import { loadMarketServerData } from "@/components/products/tg_usd/record/tg_usd_record_controller"
import { ReactNode } from "react"
import { TgUsdRecordProvider } from "@/components/products/tg_usd/record/tg_usd_record_context"
import TgUsdRecordLayout from "@/components/products/tg_usd/record/tg_usd_record_layout"
import { TgUsdMaketListProvider } from "@/components/products/tg_usd/list/tg_usd_market_list_context"

export default async function Layout({ params, children }: { params: { id: string }; children: ReactNode }) {
  const collateral = params.id

  // Hack for Pendle markets
  const toMarketSlug = collateral.replaceAll("~", "/").replaceAll("_", " ")
  const { marketInfo, collateralInfo } = await loadMarketServerData(toMarketSlug)

  return (
    <TgUsdMaketListProvider>
      <TgUsdRecordProvider collateral={collateral} collateralInfo={collateralInfo} marketInfo={marketInfo!}>
        <TgUsdRecordLayout>{children}</TgUsdRecordLayout>
      </TgUsdRecordProvider>
    </TgUsdMaketListProvider>
  )
}
