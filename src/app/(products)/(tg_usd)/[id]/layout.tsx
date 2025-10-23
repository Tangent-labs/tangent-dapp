import { ReactNode } from "react"
import USGRecordLayout from "@/components/products/tg_usd/record/tg_usd_record_layout"
import { USGRecordProvider } from "@/components/products/tg_usd/record/tg_usd_record_context"
import { USGMarketListProvider } from "@/components/products/tg_usd/list/tg_usd_market_list_context"
import { loadMarketServerData } from "@/components/products/tg_usd/record/tg_usd_record_controller"
import NotFound from "../../not-found"

export default async function Layout({ params, children }: { params: { id: string }; children: ReactNode }) {
  const collateral = await params

  const marketCollat = collateral?.id

  // Hack for Pendle markets
  const toMarketSlug = marketCollat.replaceAll("~", "/").replaceAll("_", " ")
  const { marketInfo, collateralInfo } = await loadMarketServerData(toMarketSlug)

  if (!marketInfo) {
    return <NotFound></NotFound>
  }

  return (
    <USGMarketListProvider>
      <USGRecordProvider collateral={marketCollat} collateralInfo={collateralInfo} marketInfo={marketInfo!}>
        <USGRecordLayout>{children}</USGRecordLayout>
      </USGRecordProvider>
    </USGMarketListProvider>
  )
}
