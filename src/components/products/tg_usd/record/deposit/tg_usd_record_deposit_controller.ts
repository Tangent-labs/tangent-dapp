import { CollateralInfo } from "@/types"
import MarketExternalActions from "@/abi/tgusd/MarketExternalActions.json"
import { getBorrowCommonFormState } from "../tg_usd_record_controller"
import { Abi, Address, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"
import { BalanceAllowanceData, MarketDetailData, TgUsdtMarketDepositParams, ZapMarketData } from "../../tg_usd_type"
import { executeContractCall, getPublicClient, waitForTransaction } from "@/services/service_rpc"

export function getDepositFormState(
  marketData?: MarketDetailData,
  depositWeiValue?: bigint,
  borrowWeiValue?: bigint,
  isDepositAndBorrow?: boolean,
  isWellConnected?: boolean,
  depositAssetInfo?: Address,
  collateralInfo?: CollateralInfo,
  balanceAllowanceData?: BalanceAllowanceData,
  isDepositLoading?: boolean
) {
  const isZapMode = depositAssetInfo !== collateralInfo?.address

  const reasons: string[] = []
  const isApproved =
    (!isZapMode && (depositWeiValue || 0n) <= (marketData?.collateralAllowance || 0n)) ||
    (isZapMode && (depositWeiValue || 0n) <= (balanceAllowanceData?.allowances[0]?.allowance || 0n))

  if (isDepositLoading) {
    reasons.push("Action in progress.")
  }
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
      const borrowReasons = getBorrowCommonFormState(marketData, borrowWeiValue)
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
      args: [account, args.depositWeiValue],
    }
    const txHash = await executeContractCall(walletClient, txData)
    return await waitForTransaction(txHash)
  } else {
    const txData = {
      abi: MarketExternalActions.abi as Abi,
      functionName: "depositAndBorrow",
      address: args.marketAddress,
      args: [args.depositWeiValue, args.borrowWeiValue],
    }
    const txHash = await executeContractCall(walletClient, txData)
    return await waitForTransaction(txHash)
  }
}

export const doZapDepositAndBorrow = async (
  marketAddress: Address,
  walletClient: WalletClient,
  router: string,
  routerCall: string,
  zapMarket: ZapMarketData,
  borrowWeiValue?: bigint
) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = await getPublicClient()

  const estimateGasData = {
    abi: MarketExternalActions.abi,
    functionName: "zapDepositAndBorrow",
    args: [
      borrowWeiValue,
      {
        tokenIn: zapMarket?.tokenIn,
        amountIn: zapMarket?.amountIn,
        minAmountOut: zapMarket?.minAmountOut,
        zap: { router, routerCall },
      },
    ] as unknown[],
    address: marketAddress,
    account,
    value: 0n,
  } as EstimateContractGasParameters

  if (zapMarket?.tokenIn === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    estimateGasData.value = zapMarket?.amountIn
  }

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return hash
}

export const doZapDeposit = async (marketAddress: Address, walletClient: WalletClient, router: string, routerCall: string, zapMarket: ZapMarketData) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = await getPublicClient()

  const estimateGasData = {
    abi: MarketExternalActions.abi,
    functionName: "zapDeposit",
    args: [
      account,
      {
        tokenIn: zapMarket?.tokenIn,
        amountIn: zapMarket?.amountIn,
        minAmountOut: zapMarket?.minAmountOut,
        zap: { router, routerCall },
      },
    ] as unknown[],
    address: marketAddress,
    account,
    value: 0n,
  } as EstimateContractGasParameters

  if (zapMarket?.tokenIn === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    estimateGasData.value = zapMarket?.amountIn
  }

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return hash
}
