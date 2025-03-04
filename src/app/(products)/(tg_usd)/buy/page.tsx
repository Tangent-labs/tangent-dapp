// import TgUsdBuyContent from "@/components/products/tg_usd/buy/tg_usd_buy_content"
// import { TgUsdBuyProvider } from "@/components/products/tg_usd/buy/tg_usd_buy_context"
// import { ZapToken } from "@/components/products/tg_usd/tg_usd_type"

// async function fetchTokens() {
//   const tokensData = await fetch("https://files.cow.fi/tokens/CowSwap.json")
//   const { tokens } = await tokensData.json()
//   return tokens.filter((el: ZapToken) => !!el.chainId && el.chainId === 1)
// }

// export default async function TgUsdStakePage() {
//   const tokens = await fetchTokens()

//   return (
//     <TgUsdBuyProvider tokens={tokens}>
//       <TgUsdBuyContent />
//     </TgUsdBuyProvider>
//   )
// }

import TgUsdBuyContent from "@/components/products/tg_usd/buy/tg_usd_buy_content"
import { TgUsdBuyProvider } from "@/components/products/tg_usd/buy/tg_usd_buy_context"
import { TOKENS } from "./tokens"
import { BuyToken } from "@/components/products/tg_usd/tg_usd_type"

export default async function TgUsdStakePage() {
  const tokens = TOKENS.filter((el) => !!el.chainId && el.chainId === 1) as BuyToken[]

  return (
    <TgUsdBuyProvider tokens={tokens}>
      <TgUsdBuyContent />
    </TgUsdBuyProvider>
  )
}
