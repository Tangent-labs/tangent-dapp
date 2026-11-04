import { Address } from "viem"

const addresses = process.env.NEXT_PUBLIC_ADDRESSES_JSON

if (!addresses) {
  throw new Error("ADDRESSES_JSON is not defined in the environment variables.")
}

const envAddresses = JSON.parse(addresses)

// MAX_UINT48 : endLockTime the contract writes on a permalocked position
export const PERMA_LOCK_END_TIME = "281474976710655"

// Locks are aligned on 7 day epochs, for a maximum duration of 13 of them. Locking mid epoch
// therefore gives 12 weeks plus 1 to 7 days.
export const EPOCH_DURATION = 604800n

export const LOCK_DURATION_IN_EPOCHS = 13n

export const VSTAN_CONTRACT = {
  ZAPPER: envAddresses.utilities.zappingProxy as Address,
  TAN: envAddresses.tokens.TAN as Address,
  VSTAN: envAddresses.tokens.vsTAN as Address,
  // PLACEHOLDER : sTAN is not deployed yet and is absent from the addresses JSON. Deliberately an
  // obviously-fake address so it can never be mistaken for a real one — swap it for
  // `envAddresses.tokens.sTAN` once the contract ships. Reads against it revert, which the chain
  // view guard turns into an empty state rather than a crash.
  STAN: "0x11111111111111111111111111111111111111Aa" as Address,
  TAN_LP: "0x20abec6573f0599D94396F010F4E35df3770376E",
  ETH_ORACLE: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  // Multisig holding the non-circulating TAN : the chain views exclude its balance from the circulating supply
  DAO: "0xd2c46b4c28f4B7976d9f87687863c46Bb2f71Dbb",
}
