"use client"

import { FormError, FormState, MarketDetailData } from "../../usg_type"
import { AssetDataPriced, CollateralInfo } from "@/types"
import { getBorrowCommonFormState } from "../usg_record_controller"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Address, EstimateContractGasParameters, formatEther, formatUnits, parseUnits, WalletClient, WriteContractParameters } from "viem"
import { ONE_ETHER } from "@/lib/utils"
import { dappErrors } from "@/components/design_system/notifications/form-errors"
import { NATIVE_ETH_ADDRESS } from "@/data/erc20s"

export function getLeverageFormState(
  isTransactionBlockedByPriceImpact: boolean,
  isTransactionBlockedBySlippage: boolean,
  marketData?: MarketDetailData,
  leverageExceedsMaxLtv?: boolean,
  depositWeiValue?: bigint,
  borrowWeiValue?: bigint,
  isWellConnected?: boolean,
  depositAssetInfo?: AssetDataPriced,
  collateralInfo?: CollateralInfo,
  balanceAllowanceData?: { balance: bigint; allowance: bigint },
  leverage?: number,
  isLoading?: boolean,
  maxLeverageAdjusted?: number
): FormState {
  const errors: FormError[] = []
  const isZapMode = depositAssetInfo?.address !== collateralInfo?.address
  const isApproved = (depositWeiValue || 0n) <= (balanceAllowanceData?.allowance || 0n)

  if (!isWellConnected) {
    return {
      canProcess: false,
      errors: [dappErrors["no-wallet"]],
      haveToApprove: false,
    }
  } else {
    if (maxLeverageAdjusted !== undefined && maxLeverageAdjusted < 1.5) {
      return {
        canProcess: false,
        errors: [dappErrors["low-max-leverage"]],
        haveToApprove: false,
      }
    }
    if (!isZapMode && (depositWeiValue || 0n) > (balanceAllowanceData?.balance || 0n)) {
      errors.push(dappErrors["balance"])
    }
    if (!!leverage && leverage > 1 / (1 - Number(marketData?.constants.maxLTV) / 100000)) {
      errors.push(dappErrors["max-leverage"])
    }
    if (isTransactionBlockedBySlippage) {
      errors.push(dappErrors["slippage"])
    }
    if (isTransactionBlockedByPriceImpact) {
      errors.push(dappErrors["price-impact"])
    }
    if (leverageExceedsMaxLtv) {
      errors.push(dappErrors["max-ltv"])
    }

    if (!borrowWeiValue || borrowWeiValue === 0n) {
      return {
        canProcess: false,
        errors,
        haveToApprove: !isApproved,
      }
    }

    const borrowErrors = getBorrowCommonFormState(marketData, borrowWeiValue)
    errors.push(...borrowErrors)
  }

  return {
    canProcess: isApproved && errors.length === 0 && !isLoading,
    errors,
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
    value: 0n,
  } as EstimateContractGasParameters

  if (tokenIn === NATIVE_ETH_ADDRESS) {
    estimateGasData.value = amountIn
  }

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
  totalMarketDebt: bigint,
  collateralPrice: bigint,
  usgPrice: bigint
) {
  const ltv = Number(formatUnits(maxLTV, 5))
  const maxLeverageRaw = 1 / (1 - ltv)
  // 2% margin on maxLeverage to take into account liquidity price impact
  const safeMaxLeverage = maxLeverageRaw * 0.98
  const deltaAvailable = maxMarketDebt - totalMarketDebt
  const availableToBorrow = deltaAvailable < 0n ? 0n : deltaAvailable

  const _maxLTV = maxLTV * 10n ** 13n
  const leveragedAmount = amountToDeposit + (collateralBalance * (_maxLTV - positionLTV)) / _maxLTV
  let maxLeverageAdjusted = Math.floor(safeMaxLeverage * 100) / 100

  if (leveragedAmount > 0n && collateralPrice > 0n) {
    const maxBorrowable = computeBorrowValue(leveragedAmount, collateralPrice, usgPrice, safeMaxLeverage)
    if (availableToBorrow < maxBorrowable) {
      // Both sides converted to USD — directly dividing my leveragedAmount brakes on non-stables markets
      const adjusted = Number(formatEther((availableToBorrow * usgPrice * 10n ** 18n) / (leveragedAmount * collateralPrice))) + 1
      maxLeverageAdjusted = Math.min(maxLeverageAdjusted, Math.floor(adjusted * 100) / 100)
    }
  }

  return maxLeverageAdjusted
}
