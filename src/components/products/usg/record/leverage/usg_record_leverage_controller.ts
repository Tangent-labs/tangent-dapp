import { AssetDataPriced, CollateralInfo } from "@/types"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { getBorrowCommonFormState } from "../usg_record_controller"
import { Address, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"
import { MarketDetailData } from "../../usg_type"
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
  balanceAllowanceData?: { balance: bigint; allowance: bigint }
) {
  const isZapMode = depositAssetInfo?.address !== collateralInfo?.address

  const reasons: string[] = []

  const isApproved = (depositWeiValue || 0n) <= (balanceAllowanceData?.allowance || 0n)

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

  const publicClient = getPublicClient()

  const zap = { router: zapData.routerAddress, routerCall: zapData.data }

  const estimateGasData = {
    abi: MarketExternalActions.abi,
    functionName: "zapLeverage",
    args: [
      tgUSDToFlashMint,
      minCollatAmountOut,
      { router: leverageData?.routerAddress, routerCall: leverageData?.data },
      { tokenIn, amountIn, minAmountOut, zap },
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

  const publicClient = getPublicClient()

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
