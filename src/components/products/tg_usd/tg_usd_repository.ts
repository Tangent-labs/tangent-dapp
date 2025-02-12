import { TgUsdMarket } from "./tg_usd_type"
import addresses from "./addresses.json"
import { Address } from "viem"

type RawMarket = {
  marketAddress: string
  collatName: string
  collatAddress: string
  marketType: string
}

export const tgUsdMarkets: TgUsdMarket[] = addresses.markets.map((market: RawMarket) => ({
  marketAddress: market.marketAddress as Address,
  marketName: market.collatName.replace("_", "-") as string,
  collatAddress: market.collatAddress as Address,
  marketType: market.marketType as string,
})) as TgUsdMarket[]

export const TGUSD_CONTRACT = {
  REWARD_ACCUMULATOR: addresses.utilities.rewardAccumulator as Address,
  ZAPPER: addresses.utilities.zapper as Address,
  CONTROL_TOWER: addresses.utilities.controlTower as Address,
  TG_USD: addresses.tokens.tgUSD as Address,
  SG_USD: addresses.tokens.sgUSD as Address,
  TG_USD_ORACLE: addresses.oracles.tgUSD as Address,
}
