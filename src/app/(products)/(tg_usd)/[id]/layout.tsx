import { loadMarketServerData } from "@/components/products/tg_usd/record/tg_usd_record_controller"
import { TgUsdMarketAsset } from "@/types"
import { ReactNode } from "react"
import NotFound from "../../not-found"
import { TgUsdRecordProvider } from "@/components/products/tg_usd/record/tg_usd_record_context"
import TgUsdRecordLayout from "@/components/products/tg_usd/record/tg_usd_record_layout"
import { TgUsdMaketListProvider } from "@/components/products/tg_usd/list/tg_usd_market_list_context"

export default async function Layout({ params, children }: { params: Promise<{ id: TgUsdMarketAsset }>; children: ReactNode }) {
  const collateral = (await params).id
  const { marketInfo, collateralInfo } = await loadMarketServerData(collateral)
  if (!marketInfo || !collateralInfo) return NotFound()

  return (
    <TgUsdMaketListProvider>
      <TgUsdRecordProvider collateral={collateral} collateralInfo={collateralInfo} marketInfo={marketInfo}>
        <TgUsdRecordLayout>{children}</TgUsdRecordLayout>
      </TgUsdRecordProvider>
    </TgUsdMaketListProvider>
  )
}
