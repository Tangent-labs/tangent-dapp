import { AssetDataPriced, CollateralInfo } from "@/types"
import MarketExternalActions from "@/abi/tgusd/MarketExternalActions.json"
import { getBorrowCommonFormState } from "../tg_usd_record_controller"
import { Address, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"
import { BalanceAllowanceData, MarketDetailData } from "../../tg_usd_type"
import { getPublicClient } from "@/services/service_rpc"

export function getLeverageFormState(
  marketData?: MarketDetailData,
  leverageExceedsMaxLtv?: boolean,
  depositWeiValue?: bigint,
  borrowWeiValue?: bigint,
  isDepositAndBorrow?: boolean,
  isWellConnected?: boolean,
  depositAssetInfo?: AssetDataPriced,
  collateralInfo?: CollateralInfo,
  balanceAllowanceData?: BalanceAllowanceData,
  isDepositLoading?: boolean
) {
  const isZapMode = !!balanceAllowanceData && depositAssetInfo?.address !== collateralInfo?.address

  const reasons: string[] = []
  const isApproved =
    (depositWeiValue || 0n) <= (marketData?.collateralAllowance || 0n) ||
    (isZapMode && (depositWeiValue || 0n) <= (balanceAllowanceData?.allowances[0]?.allowance || 0n))

  if (isDepositLoading) {
    reasons.push("Action in progress.")
  }
  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    if (borrowWeiValue === 0n) {
      reasons.push("No amount.")
    } else if (!isZapMode && (depositWeiValue || 0n) > (marketData?.collateralBalance || 0n)) {
      reasons.push("Not enough balance.")
    } else if (isZapMode && (depositWeiValue || 0n) > (balanceAllowanceData?.balance || 0n)) {
      reasons.push("Not enough balance.")
    }

    if (leverageExceedsMaxLtv) {
      reasons.push("Max LTV reached")
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

export const doZapLeverage = async (
  tgUSDToFlashMint: bigint,
  minCollatAmountOut: bigint,
  leverageData: { data: string; routerAddress: Address },
  tokenIn: Address,
  amountIn: bigint,
  minAmountOut: bigint,
  zapData: { data: string; routerAddress: Address },
  walletClient: WalletClient,
  marketAddress: Address
) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = await getPublicClient()

  const estimateGasData = {
    abi: MarketExternalActions.abi,
    functionName: "zapLeverage",
    args: [
      tgUSDToFlashMint,
      minCollatAmountOut,
      { router: leverageData?.routerAddress, routerCall: leverageData?.data },
      { tokenIn, amountIn, minAmountOut, zap: { router: zapData.routerAddress, routerCall: zapData.data } },
    ] as unknown[],
    address: marketAddress,
    account,
  } as EstimateContractGasParameters

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return hash
}

export const doMarketLeverage = async (
  marketAddress: Address,
  walletClient: WalletClient,
  collatToDeposit: bigint,
  tgUSDToFlashMint: bigint,
  minCollatAmountOut: bigint,
  leverageData: { routerAddress: string; data: string }
) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = await getPublicClient()

  const estimateGasData = {
    abi: MarketExternalActions.abi,
    functionName: "leverage",
    args: [collatToDeposit, tgUSDToFlashMint, minCollatAmountOut, { router: leverageData?.routerAddress, routerCall: leverageData?.data }] as unknown[],
    address: marketAddress,
    account,
  } as EstimateContractGasParameters

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return hash
}
