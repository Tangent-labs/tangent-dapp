"use server"

import { ZapToken } from "./tg_usd_type"

export async function fetchTokens() {
  const tokensData = await fetch("https://files.cow.fi/tokens/CowSwap.json")
  const { tokens } = await tokensData.json()
  return tokens.filter((el: ZapToken) => !!el.chainId && el.chainId === 1)
}
