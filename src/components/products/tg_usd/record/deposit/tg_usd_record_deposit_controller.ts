import { AssetDataPriced } from "@/types"
import Zapper from "@/abi/tgusd/Zapper.json"
import { TGUSD_CONTRACT } from "../../tg_usd_repository"
import { getSwapAssetPrice } from "@/services/service_price"
import { getBorrowCommonFormState } from "../tg_usd_record_controller"
import GetBalancesAllowances from "@/abi/tgusd/GetBalancesAllowances.json"
import MarketExternalActions from "@/abi/tgusd/MarketExternalActions.json"
import { Abi, Address, EstimateContractGasParameters, Hex, WalletClient, WriteContractParameters, zeroAddress } from "viem"
import { BalanceAllowanceData, MarketDetailData, TgUsdtMarketDepositParams, ZapMarketData, ZapToken } from "../../tg_usd_type"
import { executeAppove, executeChainViewUnique, executeContractCall, getApproveTx, getPublicClient, waitForTransaction } from "@/services/service_rpc"

export const getZapTokenBalanceAllowance = async (walletClient: WalletClient, address: Address | undefined) => {
  address = address || zeroAddress
  const [account] = await walletClient.requestAddresses()

  return await executeChainViewUnique<BalanceAllowanceData[]>(GetBalancesAllowances.abi as Abi, GetBalancesAllowances.bytecode as Hex, [
    account,
    [{ token: address, spenders: [TGUSD_CONTRACT.ZAPPER] }],
  ])
}

export function getDepositFormState(
  marketData?: MarketDetailData,
  depositWeiValue?: bigint,
  borrowWeiValue?: bigint,
  isDepositAndBorrow?: boolean,
  isWellConnected?: boolean,
  depositAssetInfo?: AssetDataPriced,
  collateralInfo?: AssetDataPriced,
  balanceAllowanceData?: BalanceAllowanceData
) {
  const isZapMode = !!depositAssetInfo && !!balanceAllowanceData && depositAssetInfo?.address !== collateralInfo?.address

  const reasons: string[] = []
  const isApproved =
    (!depositAssetInfo && (depositWeiValue || 0n) <= (marketData?.collateralAllowance || 0n)) ||
    (isZapMode && (depositWeiValue || 0n) <= (balanceAllowanceData?.allowances[0]?.allowance || 0n))

  // check the wallet
  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    if (depositWeiValue === 0n) {
      reasons.push("No amount.")
    } else if (!isZapMode && (depositWeiValue || 0n) > (marketData?.collateralBalance || 0n)) {
      reasons.push("Not enough balance.")
    } else if (isZapMode && (depositWeiValue || 0n) > (balanceAllowanceData?.balance || 0n)) {
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

export const getTokenOutQuote = async (
  depositWeiValue: bigint | undefined,
  currentAddress: Address,
  collateralInfo: AssetDataPriced,
  depositAssetInfo: AssetDataPriced
) => {
  try {
    const url = `https://api.enso.finance/api/v1/shortcuts/route?chainId=1&fromAddress=${currentAddress}&amountIn=${depositWeiValue}&tokenIn=${depositAssetInfo?.address}&tokenOut=${collateralInfo?.address}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_ENSO_API_KEY}`,
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

export const getTokenInQuote = async (
  zapValue: bigint | undefined,
  currentAddress: Address,
  collateralInfo: AssetDataPriced,
  depositAssetInfo: AssetDataPriced
) => {
  try {
    const url = `https://api.enso.finance/api/v1/shortcuts/route?chainId=1&fromAddress=${currentAddress}&amountIn=${zapValue}&tokenOut=${depositAssetInfo?.address}&tokenIn=${collateralInfo?.address.trim()}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_ENSO_API_KEY}`,
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
        Authorization: `Bearer ${process.env.NEXT_ENSO_API_KEY}`,
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

export const doApproveZap = async (walletClient: WalletClient, assetAddress: Address, amount: bigint, marketAddress: Address) => {
  const publicClient = await getPublicClient()

  const txData = getApproveTx(assetAddress, marketAddress, amount)

  const gas = await publicClient.estimateContractGas(txData as unknown as EstimateContractGasParameters)
  txData.gas = gas

  const hash = await walletClient.writeContract(txData as unknown as WriteContractParameters)
  return await waitForTransaction(hash)
}

export const doZapDeposit = async (walletClient: WalletClient, routerCall: string, zapMarket: ZapMarketData, borrowWeiValue?: bigint) => {
  if (borrowWeiValue) {
    const [account] = await walletClient.requestAddresses()

    const publicClient = await getPublicClient()

    const txData = {
      abi: Zapper.abi,
      functionName: "zapDepositAndBorrow",
      args: [zapMarket, routerCall, borrowWeiValue, false] as unknown[],
      address: TGUSD_CONTRACT.ZAPPER,
      account,
      gas: undefined as undefined | bigint,
      value: 0n,
    }

    if (zapMarket?.tokenIn === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
      txData.value = zapMarket?.amountIn
    }

    const gas = await publicClient.estimateContractGas(txData as unknown as EstimateContractGasParameters)

    txData.gas = gas

    const hash = await walletClient.writeContract(txData as unknown as WriteContractParameters)
    return hash
  } else {
    const [account] = await walletClient.requestAddresses()

    const publicClient = await getPublicClient()

    const txData = {
      abi: Zapper.abi,
      functionName: "zapDeposit",
      args: [zapMarket, routerCall, false] as unknown[],
      address: TGUSD_CONTRACT.ZAPPER,
      account,
      gas: undefined as undefined | bigint,
      value: 0n,
    }

    if (zapMarket?.tokenIn === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
      txData.value = zapMarket?.amountIn
    }

    const gas = await publicClient.estimateContractGas(txData as unknown as EstimateContractGasParameters)

    txData.gas = gas

    const hash = await walletClient.writeContract(txData as unknown as WriteContractParameters)
    return hash
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

export const prepareZapTransaction = async (
  depositWeiValue: bigint,
  collateralInfo: AssetDataPriced,
  depositAssetInfo: AssetDataPriced,
  currentAddress: Address,
  marketInfo: { marketAddress: Address },
  slippage: number
) => {
  const routerCall = await getRouteTxData(depositWeiValue, collateralInfo, depositAssetInfo, TGUSD_CONTRACT.ZAPPER, marketInfo.marketAddress, slippage * 100)

  if (!routerCall?.tx?.data) throw new Error("Failed to fetch routing data")

  const zapMarketData = {
    market: marketInfo.marketAddress,
    _for: currentAddress,
    tokenIn: depositAssetInfo?.address,
    amountIn: depositWeiValue,
    minAmountOut: 0n,
  }

  return { routerCallData: routerCall?.tx?.data, zapMarketData }
}
