import { Abi, Address, WalletClient, zeroAddress } from "viem"
import { MarketDetailData, TgUsdtMarketDepositParams, ZapToken } from "../../tg_usd_type"
import MarketExternalActions from "@/abi/tgusd/MarketExternalActions.json"
import { executeAppove, executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { getBorrowCommonFormState } from "../tg_usd_record_controller"
import { AssetDataPriced } from "@/types"
import { getSwapAssetPrice } from "@/services/service_price"

export function getDepositFormState(
  marketData?: MarketDetailData,
  depositWeiValue?: bigint,
  borrowWeiValue?: bigint,
  isDepositAndBorrow?: boolean,
  isWellConnected?: boolean
) {
  const reasons: string[] = []
  const isApproved = (depositWeiValue || 0n) <= (marketData?.collateralAllowance || 0n)

  // check the wallet
  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    if (depositWeiValue === 0n) {
      reasons.push("No amount.")
    } else if ((depositWeiValue || 0n) > (marketData?.collateralBalance || 0n)) {
      reasons.push("Not enough balance.")
    }

    if (isDepositAndBorrow) {
      const borrowReasons = getBorrowCommonFormState(marketData, depositWeiValue, borrowWeiValue)
      reasons.push(...borrowReasons)
    }
  }

  return {
    canProcess: isApproved && reasons.length === 0,
    cantProcessReasons: reasons,
    haveToApprove: !isApproved,
  }
}

export async function doMarketDeposit(walletClient: WalletClient, args: TgUsdtMarketDepositParams) {
  if (!args.isDepositAndBorrow) {
    const [account] = await walletClient.requestAddresses()
    const txData = {
      abi: MarketExternalActions.abi as Abi,
      functionName: "deposit",
      address: args.marketAddress,
      args: [account, args.depositWeiValue, args.isStaking],
      gas: undefined as undefined | bigint,
    }
    const txHash = await executeContractCall(walletClient, txData)
    return await waitForTransaction(txHash)
  } else {
    const txData = {
      abi: MarketExternalActions.abi as Abi,
      functionName: "depositAndBorrow",
      address: args.marketAddress,
      args: [args.depositWeiValue, args.borrowWeiValue, args.isStaking, zeroAddress],
      gas: undefined as undefined | bigint,
    }
    return await executeContractCall(walletClient, txData)
  }
}

export async function doApproveMarketDeposit(walletClient: WalletClient, collateralAddress: Address, args: TgUsdtMarketDepositParams) {
  const txHash = await executeAppove(walletClient, collateralAddress, args.marketAddress, args.depositWeiValue)
  return await waitForTransaction(txHash)
}

export const getEnsoRouteForZap = async (
  depositWeiValue: bigint,
  currentAddress: Address,
  collateralInfo: AssetDataPriced,
  tokens: Array<ZapToken>,
  depositAsset: string
) => {
  try {
    const tokenAddress = tokens.find((el: ZapToken) => el.name === depositAsset)?.address

    if (!tokenAddress) {
      throw new Error("Token address not found")
    }

    const url = `https://api.enso.finance/api/v1/shortcuts/route?chainId=1&fromAddress=${currentAddress}&receiver=${currentAddress}&spender=${currentAddress}&amountIn=${depositWeiValue}&slippage=300&tokenIn=${tokenAddress}&tokenOut=${collateralInfo?.address}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer coucou",
      },
    })

    // If the response is not ok, throw an error
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    // Return the response JSON
    return await response.json()
  } catch (error) {
    console.error("Failed to fetch Enso data:", error)
    return null
  }
}

export const computeSwapAssetPrice = async (tokens: ZapToken[], depositAsset: string) => {
  try {
    const tokenAddress = tokens.find((el: ZapToken) => el.name === depositAsset) ? tokens.find((el: ZapToken) => el.name === depositAsset)?.address : undefined
    if (tokenAddress) {
      const data = await getSwapAssetPrice(tokenAddress)
      return data
    } else return null
  } catch (error) {
    console.error("Failed to compute swap asset price:", error)
    return null
  }
}
