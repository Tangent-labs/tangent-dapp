import { loadMarketServerData } from "@/components/products/tg_usd/record/tg_usd_record_controller"
import { TgUsdMarketAsset } from "@/types"
import { ReactNode } from "react"
import NotFound from "../../not-found"
import { TgUsdLiquidateProvider } from "@/components/products/tg_usd/record/liquidate/tg_usd_record_liquidate_context"
import { TgUsdRecordProvider } from "@/components/products/tg_usd/record/tg_usd_record_context"
import TgUsdRecordLayout from "@/components/products/tg_usd/record/tg_usd_record_layout"

export default async function Layout({ params, children }: { params: Promise<{ id: TgUsdMarketAsset }>; children: ReactNode }) {
  const collateral = (await params).id
  const { marketInfo, tgUSDInfo, collateralInfo } = await loadMarketServerData(collateral)
  if (!marketInfo || !tgUSDInfo || !collateralInfo) return NotFound()
  return (
    <>
      <TgUsdRecordProvider collateral={collateral} collateralInfo={collateralInfo} marketInfo={marketInfo} tgUSDInfo={tgUSDInfo}>
        <TgUsdRecordLayout currentFeature="">
          <TgUsdLiquidateProvider>{children}</TgUsdLiquidateProvider>
        </TgUsdRecordLayout>
      </TgUsdRecordProvider>
    </>
  )
}
