import { AssetData } from "@/types"
import { TOKEN_ADDR } from "@/services/repo_asset_addresses"

export type AssetConfigKey = keyof typeof TOKEN_ADDR

export const assetConfig: Record<AssetConfigKey, AssetData> = {
  USDC: {
    address: TOKEN_ADDR.USDC,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    displayDecimals: 2,
    logo: "USDC",
  },
  CVX: {
    address: TOKEN_ADDR.CVX,
    symbol: "CVX",
    name: "Convex",
    decimals: 18,
    displayDecimals: 0,
    logo: "CVX",
  },
  CRV: {
    address: TOKEN_ADDR.CRV,
    name: "Curve DAO",
    symbol: "CRV",
    decimals: 18,
    displayDecimals: 0,
    logo: "CRV",
  },
}
