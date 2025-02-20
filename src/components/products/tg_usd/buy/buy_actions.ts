import { AssetDataPriced } from "@/types"
import { Address } from "viem"

export const getTokenInQuote = async (
  zapValue: bigint | undefined,
  currentAddress: Address,
  depositAssetInfo: AssetDataPriced,
  receiveAssetInfo: AssetDataPriced
) => {
  try {
    const url = `https://api.enso.finance/api/v1/shortcuts/route?chainId=1&fromAddress=${currentAddress}&amountIn=${zapValue}&tokenOut=${receiveAssetInfo?.address}&tokenIn=${depositAssetInfo?.address.trim()}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer adbdf776-54d8-48b1-bbcc-b18a20a4078d`,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch Enso data:", error)
    return null
  }
}

export const getRouteTxData = async (
  amountIn: bigint | undefined,
  collateralInfo: AssetDataPriced,
  depositAssetInfo: AssetDataPriced,
  fromAddress: Address,
  receiver: Address,
  slippage?: number
) => {
  try {
    const url = `https://api.enso.finance/api/v1/shortcuts/route?chainId=1&fromAddress=${fromAddress}&receiver=${receiver}&tokenIn=${depositAssetInfo?.address}&tokenOut=${collateralInfo?.address.trim()}&amountIn=${amountIn}&slippage=${slippage}&routingStrategy=router`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer adbdf776-54d8-48b1-bbcc-b18a20a4078d`,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch Enso data:", error)
    return null
  }
}

export const getTokenOutQuote = async (
  depositWeiValue: bigint | undefined,
  currentAddress: Address,
  depositAssetInfo: AssetDataPriced,
  receiveAssetInfo: AssetDataPriced
) => {
  try {
    const url = `https://api.enso.finance/api/v1/shortcuts/route?chainId=1&fromAddress=${currentAddress}&amountIn=${depositWeiValue}&tokenIn=${depositAssetInfo?.address}&tokenOut=${receiveAssetInfo?.address}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer adbdf776-54d8-48b1-bbcc-b18a20a4078d`,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch Enso data:", error)
    return null
  }
}
