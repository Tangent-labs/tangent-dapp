import USGSwapContent from "@/components/products/tg_usd/swap/tg_usd_swap_content"
import { USGSwapProvider } from "@/components/products/tg_usd/swap/tg_usd_swap_context"

export default async function USGSwapPage() {
  return (
    <USGSwapProvider>
      <USGSwapContent />
    </USGSwapProvider>
  )
}
