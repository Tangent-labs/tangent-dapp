import TgUsdSwapContent from "@/components/products/tg_usd/swap/tg_usd_swap_content"
import { TgUsdSwapProvider } from "@/components/products/tg_usd/swap/tg_usd_swap_context"
import { TOKENS } from "./tokens"
import { SwapToken } from "@/components/products/tg_usd/tg_usd_type"

export default async function TgUsdSwapPage() {
  const tokens = TOKENS.filter((el) => !!el.chainId && el.chainId === 1) as SwapToken[]

  return (
    <TgUsdSwapProvider tokens={tokens}>
      <TgUsdSwapContent />
    </TgUsdSwapProvider>
  )
}
