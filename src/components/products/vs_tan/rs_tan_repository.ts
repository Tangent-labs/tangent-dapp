import { Address } from "viem"

const addresses = process.env.NEXT_PUBLIC_ADDRESSES_JSON

if (!addresses) {
  throw new Error("ADDRESSES_JSON is not defined in the environment variables.")
}

const envAddresses = JSON.parse(addresses)

// MAX_UINT48 : endLockTime the contract writes on a perma locked position
export const PERMA_LOCK_END_TIME = "281474976710655"

// Locks are aligned on 7 day epochs, for a maximum duration of 13 of them. Locking mid epoch
// therefore gives 12 weeks plus 1 to 7 days.
export const EPOCH_DURATION = 604800n

export const LOCK_DURATION_IN_EPOCHS = 13n

export const VSTAN_CONTRACT = {
  ZAPPER: envAddresses.utilities.zappingProxy as Address,
  TAN: envAddresses.tokens.TAN as Address,
  VSTAN: envAddresses.tokens.vsTAN as Address,
  STAN: envAddresses.tokens.sTAN as Address,
  TAN_LP: envAddresses.lps?.["TAN-WETH"],
  ETH_ORACLE: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  DAO: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
}
