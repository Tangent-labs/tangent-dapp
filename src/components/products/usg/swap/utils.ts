import { AssetDataPriced } from "@/types"
import { SwapToken } from "../usg_type"
import { USGTokens } from "../usg_repository"
import { Address } from "viem"
import { ERC20S } from "@/data/erc20s"

export const wTokens: SwapToken[] = Object.entries(USGTokens).flatMap(([, group]) =>
  Object.entries(group).map(([name, address]) => ({
    name,
    symbol: name,
    value: name,
    address: address as Address,
    decimals: 18,
    displayDecimals: 2,
    logoURI: "null",
  }))
)

export const resolveAssetName = (assetAddress: string | null | undefined): string | null => {
  if (!assetAddress) return null

  const normalized = assetAddress.toLowerCase()

  const found = ERC20S.find((el) => el.address.toLowerCase() === normalized)
  // ||wTokens.find((el) => el.address.toLowerCase() === normalized)

  return found?.symbol ?? assetAddress
}
/**
 * Builds AssetDataPriced by resolving an asset name against known tokens and USGTokens.
 * Returns null if the asset or price is not available.
 */
export const buildAssetInfo = (tokenAddress: string | null | undefined, price: number | null): AssetDataPriced | null => {
  if (!tokenAddress || !price) return null
  const assetInfo = ERC20S.find((el) => el.address.toLowerCase() === tokenAddress.toLowerCase())
  // || wTokens.find((el) => el.tokenAddress === tokenAddress || el.symbol === assetName)

  if (!assetInfo) return null

  return {
    address: assetInfo.address,
    decimals: assetInfo.decimals,
    displayDecimals: 2,
    symbol: assetInfo.symbol,
    name: assetInfo.name,
    price,
  }
}
