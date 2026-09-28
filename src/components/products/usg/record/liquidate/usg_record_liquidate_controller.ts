"use client"

import { formatBigInt } from "@/lib/number_formatter"
import { FormError, FormState, MarketDetailData } from "../../usg_type"
import MarketExternalActions from "@/abi/USG/MarketExternalActions.json"
import { getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { dappErrors } from "@/components/design_system/notifications/form-errors"
import { Abi, Address, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"

const COLLATERAL_PRICE_DECIMALS = 10n ** 18n
const LTV_DENOMINATOR = 100_000n
const AUTO_REPAY_TARGET_RATIO_NUMERATOR = 995n
const AUTO_REPAY_TARGET_RATIO_DENOMINATOR = 1000n

function getFutureLiquidationPosition(marketData: MarketDetailData, liquidateWeiValue: bigint, repayWeiValue: bigint) {
  const currentCollateral = marketData.collateralInfos?.positionCollateralAmount || 0n
  const currentDebt = marketData.debtInfos?.userDebt || 0n
  const collateralUsdPrice = marketData.collateralInfos?.collateralUSDPrice || 0n

  const futureCollateral = currentCollateral > liquidateWeiValue ? currentCollateral - liquidateWeiValue : 0n
  const futureDebt = currentDebt > repayWeiValue ? currentDebt - repayWeiValue : 0n
  const futureCollateralUsdValue = (futureCollateral * collateralUsdPrice) / COLLATERAL_PRICE_DECIMALS

  return { futureCollateral, futureDebt, futureCollateralUsdValue }
}

export function computeLiquidateAutoRepayValue(marketData: MarketDetailData, liquidateWeiValue: bigint) {
  const maxLtv = marketData.constants?.maxLTV || 0n
  const currentDebt = marketData.debtInfos?.userDebt || 0n
  const { futureCollateralUsdValue, futureDebt } = getFutureLiquidationPosition(marketData, liquidateWeiValue, 0n)

  if (currentDebt === 0n || futureCollateralUsdValue === 0n || maxLtv === 0n) {
    return currentDebt
  }

  const targetLtv = (maxLtv * AUTO_REPAY_TARGET_RATIO_NUMERATOR) / AUTO_REPAY_TARGET_RATIO_DENOMINATOR

  if (futureDebt * LTV_DENOMINATOR <= futureCollateralUsdValue * targetLtv) {
    return 0n
  }

  const maxDebtAtTargetLtv = (futureCollateralUsdValue * targetLtv) / LTV_DENOMINATOR

  return currentDebt > maxDebtAtTargetLtv ? currentDebt - maxDebtAtTargetLtv : 0n
}

export function isLiquidateMaxLtvExceeded(marketData: MarketDetailData, liquidateWeiValue: bigint, repayWeiValue: bigint) {
  const maxLtv = marketData.constants?.maxLTV || 0n
  const { futureCollateralUsdValue, futureDebt } = getFutureLiquidationPosition(marketData, liquidateWeiValue, repayWeiValue)

  if (futureDebt <= 0n) return false
  if (futureCollateralUsdValue <= 0n) return true

  return futureDebt * LTV_DENOMINATOR > futureCollateralUsdValue * maxLtv
}

export function getLiquidateFormState(
  marketData: MarketDetailData,
  withdrawWeiValue: bigint,
  repayWeiValue: bigint,
  isWellConnected: boolean,
  isLoading: boolean,
  isTransactionBlockedByPriceImpact: boolean,
  isTransactionBlockedBySlippage: boolean
): FormState {
  const errors: FormError[] = []

  if (!isWellConnected) {
    return {
      canProcess: false,
      errors: [dappErrors["no-wallet"]],
      haveToApprove: false,
    }
  } else {
    if (withdrawWeiValue > marketData?.collateralInfos?.positionCollateralAmount) {
      errors.push(dappErrors["max-withdrawable"])
    }

    if (isTransactionBlockedByPriceImpact) {
      errors.push(dappErrors["price-impact"])
    }

    if (isTransactionBlockedBySlippage) {
      errors.push(dappErrors["slippage"])
    }
  }

  const existingDebt = marketData.debtInfos?.userDebt || 0n
  const minimumLoan = marketData.constants?.minimumLoan || 0n

  if (!repayWeiValue && !withdrawWeiValue) {
    return { canProcess: false, errors: [], haveToApprove: false }
  } else if (repayWeiValue && repayWeiValue > existingDebt) {
    errors.push(dappErrors["repay-exceeds-debt"])
  } else if (existingDebt - repayWeiValue! > 0n && existingDebt - repayWeiValue! < minimumLoan) {
    errors.push({
      key: "min-debt",
      title: "Remaining Debt Too Low",
      subtitle: `Remaining debt must be at least ${formatBigInt(minimumLoan, 18, 2)} USG.`,
      content: "Either repay the full debt or leave at least the minimum loan amount.",
      type: "form-alert",
    })
  } else if (withdrawWeiValue > 0n && isLiquidateMaxLtvExceeded(marketData, withdrawWeiValue, repayWeiValue)) {
    errors.push(dappErrors["max-ltv"])
  }

  return { canProcess: errors.length === 0 && !isLoading, errors, haveToApprove: false }
}

export async function doMarketLiquidate(
  collatAmountToLiquidate: bigint,
  usgToRepay: bigint,
  maxUsgToBurn: bigint,
  minUsgOut: bigint,
  isReceiptOut: boolean,
  liquidationData: { routerAddress: string; data: string },
  walletClient: WalletClient,
  market: Address
) {
  const publicClient = getPublicClient()

  const estimateGasData = {
    abi: MarketExternalActions.abi as Abi,
    functionName: "selfLiquidate",
    address: market,
    args: [
      { collatAmountToLiquidate, usgToRepay, maxUsgToBurn, minUsgOut, isReceiptOut },
      { router: liquidationData?.routerAddress, routerCall: liquidationData?.data },
    ],
    gas: undefined as undefined | bigint,
    account: walletClient.account,
  } as EstimateContractGasParameters

  const gas = await publicClient.estimateContractGas(estimateGasData)

  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return await waitForTransaction(hash)
}
