"use client"

import { MarketDetailData } from "../../usg_type"
import { AssetDataPriced, CollateralInfo } from "@/types"
import { getBorrowCommonFormState, NO_CONNECTED_WALLET } from "../usg_record_controller"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Address, EstimateContractGasParameters, formatEther, formatUnits, parseUnits, WalletClient, WriteContractParameters } from "viem"
import { ONE_ETHER } from "@/lib/utils"

export function getLeverageFormState(
  isTransactionBlockedByPriceImpact: boolean,
  isTransactionBlockedBySlippage: boolean,
  marketData?: MarketDetailData,
  leverageExceedsMaxLtv?: boolean,
  depositWeiValue?: bigint,
  borrowWeiValue?: bigint,
  isDepositAndBorrow?: boolean,
  isWellConnected?: boolean,
  depositAssetInfo?: AssetDataPriced,
  collateralInfo?: CollateralInfo,
  balanceAllowanceData?: { balance: bigint; allowance: bigint },
  leverage?: number,
  isLoading?: boolean
) {
  const isZapMode = depositAssetInfo?.address !== collateralInfo?.address

  const reasons: string[] = []

  const isApproved = (depositWeiValue || 0n) <= (balanceAllowanceData?.allowance || 0n)

  if (!isWellConnected) {
    reasons.push(NO_CONNECTED_WALLET)
  } else {
    if (!isZapMode && (depositWeiValue || 0n) > (balanceAllowanceData?.balance || 0n)) {
      reasons.push("Not enough balance.")
    } else if (!!leverage && leverage > 1 / (1 - Number(marketData?.constants.maxLTV) / 100000)) {
      reasons.push("Reduce leverage.")
    } else if (isTransactionBlockedBySlippage) {
      reasons.push("Slippage is too high.")
    } else if (isTransactionBlockedByPriceImpact) {
      reasons.push("Price impact is too high.")
    }

    if (leverageExceedsMaxLtv) {
      reasons.push("Reduce your leverage or add more collateral.")
    }

    if (isDepositAndBorrow) {
      const borrowReasons = getBorrowCommonFormState(marketData, borrowWeiValue)
      reasons.push(...borrowReasons)
    }
  }

  return {
    canProcess: isApproved && reasons.length === 0 && !isLoading,
    cantProcessReasons: reasons,
    haveToApprove: !isApproved,
  }
}

export const doZapLeverage = async (
  usgToFlashMint: bigint,
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
      usgToFlashMint,
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
  return await waitForTransaction(hash)
}

export const doMarketLeverage = async (
  marketAddress: Address,
  walletClient: WalletClient,
  collatToDeposit: bigint,
  usgToFlashMint: bigint,
  minCollatAmountOut: bigint,
  isReceiptIn: boolean,
  leverageData: { routerAddress: string; data: string }
) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = getPublicClient()

  const estimateGasData = {
    abi: MarketExternalActions.abi,
    functionName: "leverage",
    args: [
      { collatToDeposit, usgToFlashMint, minCollatAmountOut, isReceiptIn },
      { router: leverageData?.routerAddress, routerCall: leverageData?.data },
    ] as unknown[],
    address: marketAddress,
    account,
  } as EstimateContractGasParameters

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return await waitForTransaction(hash)
}

export function computeBorrowValue(leveragedCollateralAmount: bigint, collateralPrice: bigint, usgPrice: bigint, leverageFactor: number) {
  const collatToBuy = (leveragedCollateralAmount * parseUnits((leverageFactor - 1).toString(), 2)) / 100n

  const expectedCollateralFinalDollarValue = (collatToBuy * collateralPrice) / ONE_ETHER
  const usgAmountToBorrow = (expectedCollateralFinalDollarValue * ONE_ETHER) / usgPrice
  return usgAmountToBorrow
}

// Regarding amounts in collateral in the deposit input
// It's possible that the maximum leverage gets reduced related to the available USG to borrow on the market
export function computeMaxLeverageAdjusted(
  maxLTV: bigint,
  positionLTV: bigint,
  amountToDeposit: bigint,
  collateralBalance: bigint,
  maxMarketDebt: bigint,
  totalMarketDebt: bigint
) {
  const ltv = Number(formatUnits(maxLTV, 5))
  const maxLeverageRaw = 1 / (1 - ltv)
  // 2% marging on maxLeverage to take into account liquidity price impact
  const safeMaxLeverage = maxLeverageRaw * 0.98
  const deltaAvailable = maxMarketDebt - totalMarketDebt
  const availableToBorrow = deltaAvailable < 0n ? 0n : deltaAvailable

  const _maxLTV = maxLTV * 10n ** 13n

  const leveragedAmount = amountToDeposit + (collateralBalance * (_maxLTV - positionLTV)) / _maxLTV
  let maxLeverageAdjusted = Math.floor(safeMaxLeverage * 100) / 100

  if (leveragedAmount > 0n) {
    // available = leveragedAmount * (adjustedLeverage - 1)
    // adjustedLeverage = available / leveragedAmount + 1
    const adjusted = leveragedAmount > 0n ? Number(formatEther((availableToBorrow * 10n ** 18n) / leveragedAmount)) + 1 : 1
    maxLeverageAdjusted = Math.min(maxLeverageAdjusted, Math.floor(adjusted * 100) / 100)
  }

  return maxLeverageAdjusted
}
