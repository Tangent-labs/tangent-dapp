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
  STAN: envAddresses.tokens.sTAN as Address,
  TAN_LP: "0xA8544AC03917A5483359685aDF59AF09d19B24c5",
  ETH_ORACLE: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  DAO: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
}
