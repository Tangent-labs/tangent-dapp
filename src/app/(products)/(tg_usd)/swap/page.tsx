import TgUsdSwapContent from "@/components/products/tg_usd/swap/tg_usd_swap_content"
import { TgUsdSwapProvider } from "@/components/products/tg_usd/swap/tg_usd_swap_context"

export default async function TgUsdSwapPage() {
  return (
    <TgUsdSwapProvider>
      <TgUsdSwapContent />
    </TgUsdSwapProvider>
  )
}
