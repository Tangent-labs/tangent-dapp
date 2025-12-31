import { Address } from "viem"

export const TOKEN_ADDR: Record<string, Address> = {
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  CRV: "0xD533a949740bb3306d119CC777fa900bA034cd52",
  CVX: "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  BAL: "0xba100000625a3754423978a60c9317c58a424e3D",
  PENDLE: "0x808507121B80c02388fAd14726482e061B8da827",
  FXN: "0x365AccFCa291e7D3914637ABf1F7635dB165Bb09",
  CRVUSD: "0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E",
  ETH: "0x0",
  SDT: "0x73968b9a57c6E53d41345FD57a6E6ae27d6CDB2F",
  wstETH: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
  TRICRV: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
  crvUSD: "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e",
  scrvUSD: "0x0655977feb2f289a4ab78af67bab0d17aab84367",
  frxUSD: "0xcacd6fd266af91b8aed52accc382b4e165586e29",
}

export const ADDR_TOKEN: Record<Address, string> = Object.entries(TOKEN_ADDR).reduce(
  (acc, [symbol, address]) => {
    acc[address] = symbol

    return acc
  },
  {} as Record<string, string>
)
