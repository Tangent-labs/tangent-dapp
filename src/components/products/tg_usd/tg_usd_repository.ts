import { TgUsdMarket } from "./tg_usd_type"
import { Address } from "viem"

const addresses = process.env.NEXT_PUBLIC_ADDRESSES_JSON

if (!addresses) {
  throw new Error("ADDRESSES_JSON is not defined in the environment variables.")
}

const envAddresses = JSON.parse(addresses)

type RawMarket = {
  marketAddress: string
  collatName: string
  collatAddress: string
  marketType: string
}

export const tgUsdTokens = [envAddresses.wStables, envAddresses.lps, envAddresses.tokens]

export const tgUsdMarkets: TgUsdMarket[] = envAddresses.markets.map((market: RawMarket) => ({
  marketAddress: market.marketAddress as Address,
  marketName: market.collatName.replace("_", "-"),
  collatAddress: market.collatAddress as Address,
  marketType: market.marketType,
})) as TgUsdMarket[]

export const TGUSD_CONTRACT = {
  REWARD_ACCUMULATOR: envAddresses.utilities.rewardAccumulator as Address,
  ZAPPER: envAddresses.utilities.zapper as Address,
  CONTROL_TOWER: envAddresses.utilities.controlTower as Address,
  TG_USD: envAddresses.tokens.tgUSD as Address,
  SG_USD: envAddresses.tokens.sgUSD as Address,
  TAN: envAddresses.tokens.tan as Address,
  RSTAN: envAddresses.tokens.rsTan as Address,
  TG_USD_ORACLE: envAddresses.oracles.tgUSD as Address,
}
