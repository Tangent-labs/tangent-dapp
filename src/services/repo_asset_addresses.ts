import { Address } from "viem"

export const TOKEN_ADDR: Record<string, Address> = {
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  CRV: "0xD533a949740bb3306d119CC777fa900bA034cd52",
  CVX: "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
}

export const ADDR_TOKEN: Record<Address, string> = Object.entries(TOKEN_ADDR).reduce(
  (acc, [symbol, address]) => {
    acc[address] = symbol
    return acc
  },
  {} as Record<string, string>
)
