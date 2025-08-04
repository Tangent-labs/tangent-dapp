import { Address } from "viem"

const addresses = process.env.NEXT_PUBLIC_ADDRESSES_JSON

if (!addresses) {
  throw new Error("ADDRESSES_JSON is not defined in the environment variables.")
}

const envAddresses = JSON.parse(addresses)

export const VSTAN_CONTRACT = {
  ZAPPER: envAddresses.utilities.zappingProxy as Address,
  TAN: envAddresses.tokens.TAN as Address,
  VSTAN: envAddresses.tokens.vsTAN as Address,
  STAN: envAddresses.tokens.sTan as Address,
}
