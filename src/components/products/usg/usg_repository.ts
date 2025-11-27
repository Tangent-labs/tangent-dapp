import { USGMarket } from "./usg_type"
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

export const tgUsdPegKeepers: Address[] = Object.values(envAddresses.pegKeepers)

export const USGMarkets: USGMarket[] = envAddresses.markets.map((market: RawMarket) => ({
  marketAddress: market.marketAddress as Address,
  marketName: market.collatName.replace("_", "-"),
  collatAddress: market.collatAddress as Address,
  marketType: market.marketType,
})) as USGMarket[]

export const CurveCollaterals: Array<Address> = envAddresses.markets
  .filter((m: RawMarket) => m.marketType.includes("Convex_CRV"))
  .map((market: RawMarket) => market.collatAddress as Address)

export const PendleCollaterals: Array<Address> = envAddresses.markets
  .filter((m: RawMarket) => m.marketType.includes("Pendle_PT"))
  .map((market: RawMarket) => market.collatAddress as Address)

export const USG_CONTRACT = {
  REWARD_ACCUMULATOR: envAddresses.utilities.rewardAccumulator as Address,
  LIQUIDATOR_PROXY: envAddresses.utilities.liquidatorProxy as Address,
  ZAPPER: envAddresses.utilities.zappingProxy as Address,
  CONTROL_TOWER: envAddresses.utilities.controlTower as Address,
  USG: envAddresses.tokens.USG as Address,
  SUSG: envAddresses.tokens.sUSG as Address,
  USG_ORACLE: envAddresses.oracles.USG as Address,
  ENSO_ROUTER: "0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf",
  CURVE_ROUTER: "0x45312ea0eff7e09c83cbe249fa1d7598c4c8cd4e",
  PENDLE_ROUTER: "0x6d041EF9096F7013d27fF7a41c17971201499879",
  DAO: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
}
