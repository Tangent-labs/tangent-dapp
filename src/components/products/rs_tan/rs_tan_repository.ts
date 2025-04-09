import { Address } from "viem"

const addresses = process.env.NEXT_PUBLIC_ADDRESSES_JSON

if (!addresses) {
  throw new Error("ADDRESSES_JSON is not defined in the environment variables.")
}

const envAddresses = JSON.parse(addresses)

export const RSTAN_CONTRACT = {
  ZAPPER: envAddresses.utilities.zapper as Address,
  TAN: envAddresses.tokens.tan as Address,
  RSTAN_SERVICE: envAddresses.lock.rsTanService as Address,
  RSTAN_ERC_721: envAddresses.lock.rsTanERC721 as Address,
}
