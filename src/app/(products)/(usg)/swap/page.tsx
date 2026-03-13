import USGSwapContent from "@/components/products/usg/swap/usg_swap_content"
import { USGSwapProvider } from "@/components/products/usg/swap/usg_swap_context"
import { Suspense } from "react"

export default async function USGSwapPage() {
  return (
    <Suspense>
      <USGSwapProvider>
        <USGSwapContent />
      </USGSwapProvider>
    </Suspense>
  )
}
