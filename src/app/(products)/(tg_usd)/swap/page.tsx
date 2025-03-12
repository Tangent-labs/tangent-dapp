// import TgUsdSwapContent from "@/components/products/tg_usd/buy/tg_usd_buy_content"
// import { TgUsdSwapProvider } from "@/components/products/tg_usd/buy/tg_usd_buy_context"
// import { ZapToken } from "@/components/products/tg_usd/tg_usd_type"

// async function fetchTokens() {
//   const tokensData = await fetch("https://files.cow.fi/tokens/CowSwap.json")
//   const { tokens } = await tokensData.json()
//   return tokens.filter((el: ZapToken) => !!el.chainId && el.chainId === 1)
// }

// export default async function TgUsdStakePage() {
//   const tokens = await fetchTokens()

//   return (
//     <TgUsdSwapProvider tokens={tokens}>
//       <TgUsdSwapContent />
//     </TgUsdSwapProvider>
//   )
// }

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
