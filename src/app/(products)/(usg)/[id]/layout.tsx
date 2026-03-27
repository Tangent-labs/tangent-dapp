import { ReactNode } from "react"
import USGRecordLayout from "@/components/products/usg/record/usg_record_layout"
import { USGRecordProvider } from "@/components/products/usg/record/usg_record_context"
import { USGMarketListProvider } from "@/components/products/usg/list/usg_market_list_context"
import { Address } from "viem"

export default async function Layout({ params, children }: { params: { id: Address }; children: ReactNode }) {
  const market = await params
  const marketAddress = market?.id

  return (
    <USGMarketListProvider>
      <USGRecordProvider marketAddress={marketAddress}>
        <USGRecordLayout>{children}</USGRecordLayout>
      </USGRecordProvider>
    </USGMarketListProvider>
  )
}
