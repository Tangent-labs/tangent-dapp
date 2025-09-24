import { ReactNode } from "react"
import USGRecordLayout from "@/components/products/tg_usd/record/tg_usd_record_layout"
import { USGRecordProvider } from "@/components/products/tg_usd/record/tg_usd_record_context"
import { USGMaketListProvider } from "@/components/products/tg_usd/list/tg_usd_market_list_context"
import { loadMarketServerData } from "@/components/products/tg_usd/record/tg_usd_record_controller"

export default async function Layout({ params, children }: { params: { id: string }; children: ReactNode }) {
  const collateral = params.id

  // Hack for Pendle markets
  const toMarketSlug = collateral.replaceAll("~", "/").replaceAll("_", " ")
  const { marketInfo, collateralInfo } = await loadMarketServerData(toMarketSlug)

  return (
    <USGMaketListProvider>
      <USGRecordProvider collateral={collateral} collateralInfo={collateralInfo} marketInfo={marketInfo!}>
        <USGRecordLayout>{children}</USGRecordLayout>
      </USGRecordProvider>
    </USGMaketListProvider>
  )
}
