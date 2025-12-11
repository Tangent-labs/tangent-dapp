import { ReactNode } from "react"
import USGRecordLayout from "@/components/products/usg/record/usg_record_layout"
import { USGRecordProvider } from "@/components/products/usg/record/usg_record_context"
import { USGMarketListProvider } from "@/components/products/usg/list/usg_market_list_context"
import { loadMarketServerData } from "@/components/products/usg/record/usg_record_controller"
import NotFound from "../../not-found"
import { Address } from "viem"

export default async function Layout({ params, children }: { params: { id: Address }; children: ReactNode }) {
  const collateral = await params

  const collateralAddress = collateral?.id

  const { marketInfo, collateralInfo } = await loadMarketServerData(collateralAddress)

  if (!marketInfo) {
    return <NotFound></NotFound>
  }

  return (
    <USGMarketListProvider>
      <USGRecordProvider collateral={marketInfo?.marketName} collateralInfo={collateralInfo} marketInfo={marketInfo!}>
        <USGRecordLayout>{children}</USGRecordLayout>
      </USGRecordProvider>
    </USGMarketListProvider>
  )
}
