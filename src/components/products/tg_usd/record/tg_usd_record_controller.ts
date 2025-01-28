import { Abi, Address, formatEther, formatUnits, Hex, parseEther, zeroAddress } from "viem"
import { ChainViewMarketRow, MarketDetailData, TgUsdMarketDisplayData, TgUsdMarketLoanDisplayData } from "../tg_usd_type"
import { executeChainViewUnique } from "@/services/service_rpc"
import MarketDetailsUI from "@/abi/tgusd/MarketDetailsUI.json"
import { AssetDataPriced, ExistingAsset } from "@/types"
import { tgUsdMarkets } from "../tg_usd_repository"
import { getAssetInfo } from "@/services/service_existing_asset"
import { formatDollar, formatDollarBigInt, formatNumber } from "@/lib/number_formatter"

const DENOMINATOR = 100_000n
const DECIMALS = BigInt(10 ** 18)

export const getTgUsdMarketRecordData = async (address: Address | undefined, market: Address) => {
  address = address || zeroAddress
  return await executeChainViewUnique<ChainViewMarketRow>(MarketDetailsUI.abi as Abi, MarketDetailsUI.bytecode as Hex, [address, market])
}

export const transformMarketData = (onChainData: ChainViewMarketRow, collateralInfo: AssetDataPriced): MarketDetailData => {
  const staticMarketData = tgUsdMarkets.find((m) => m.marketAddress === onChainData.marketAddress)
  return {
    marketAddress: onChainData.marketAddress as Address,
    collateralInfo,
    debtInfos: onChainData.debtInfos,
    constants: onChainData.constants,
    collateralBalance: BigInt(onChainData.obas.find((o) => o.token === collateralInfo.address)?.balance || 0n),
    collateralAllowance: BigInt(
      onChainData.obas.find((o) => o.token === collateralInfo.address)?.allowances?.find((a) => a.spender === onChainData.marketAddress)?.allowance || 0n
    ),
    collateralInfos: onChainData.collateralInfos,
    marketType: staticMarketData?.marketType,
  }
}

export function getBorrowCommonFormState(marketData?: MarketDetailData, depositWeiValue?: bigint, borrowWeiValue?: bigint) {
  const reasons: string[] = []

  if (!borrowWeiValue || borrowWeiValue === 0n) {
    reasons.push("No amount.")
  } else {
    const minLoan = BigInt(marketData?.constants?.minimumLoan || "0")
    const totalDebt = BigInt(marketData?.debtInfos?.totalDebt || 0n)

    if (borrowWeiValue + totalDebt < minLoan) {
      reasons.push(`Min debt is ${formatEther(minLoan)}`)
    } else {
      const depositedCollateral = BigInt(marketData?.collateralInfos?.positionCollateralUSDValue || 0n)
      const existingDebt = BigInt(marketData?.debtInfos?.positionDebt || 0n)
      const maxLTV = BigInt(marketData?.constants.maxLTV || "0") / 10000n
      const maxMarketDebt = BigInt(marketData?.constants.maxMarketDebt || "0")
      const maxLoan = maxLTV * (depositWeiValue || 0n) + depositedCollateral
      if (maxLoan < borrowWeiValue + existingDebt) {
        reasons.push(`max debt is ${parseEther(maxLoan.toString())}`)
      }
      if (maxMarketDebt < borrowWeiValue + totalDebt) {
        reasons.push(`max market debt is exceeded`)
      }
    }
  }
  return reasons
}

export function getComputedFutureLoanData(
  marketData?: MarketDetailData,
  collateralInfo?: AssetDataPriced,
  amounts?: {
    depositWeiValue?: bigint
    borrowWeiValue?: bigint
    withdrawWeiValue?: bigint
    repayWeiValue?: bigint
  }
) {
  amounts = { ...{ borrowWeiValue: 0n, repayWeiValue: 0n, depositWeiValue: 0n, withdrawWeiValue: 0n }, ...(amounts || {}) }

  if (!marketData || !collateralInfo)
    return {
      collateralValue: "-",
      debt: "-",
      health: "-",
      ltv: "-",
      maxBorrowable: "-",
      maxWithdrawable: "-",
    }

  const collateralValueToNumber = (value: bigint | number) => Number(formatUnits(BigInt(value), collateralInfo?.decimals || 18))
  const etherValueToNumber = (value: bigint) => Number(formatEther(value))
  const collateralPriceRaw = BigInt(marketData?.collateralInfos?.collateralUSDPrice || 0n)
  const collateralprice = etherValueToNumber(collateralPriceRaw)
  const liquidationThresholdRaw = BigInt(marketData?.constants?.liquidationThreshold || 0n)

  const futureDebt = BigInt(marketData?.debtInfos?.positionDebt || 0n) + BigInt(amounts.borrowWeiValue!) - BigInt(amounts.repayWeiValue!)
  const futureDeposited =
    BigInt(marketData?.collateralInfos?.positionCollateralAmount || 0n) + BigInt(amounts.depositWeiValue!) - BigInt(amounts.withdrawWeiValue!)
  const futureDepositedDollarRaw = (futureDeposited * collateralPriceRaw) / DECIMALS
  const futureDepositedDollar = collateralValueToNumber(futureDeposited) * collateralprice
  const maxLTV = BigInt(marketData?.constants.maxLTV || "0") / 1000n
  const maxBorrowable = (futureDeposited * maxLTV) / 100n - (futureDebt * DECIMALS) / collateralPriceRaw
  const maxWithDrawable = collateralPriceRaw !== 0n ? futureDepositedDollarRaw - (futureDebt * DECIMALS) / ((collateralPriceRaw * maxLTV) / 100n) : 0n
  const ltv = futureDepositedDollar !== 0 ? (Number(futureDebt) / futureDepositedDollar) * 100 : 0
  const health = futureDebt !== 0n ? (futureDeposited * collateralPriceRaw * liquidationThresholdRaw) / (futureDebt * DENOMINATOR) : 0n

  return {
    collateralValue: formatDollar(futureDepositedDollar, 0),
    debt: formatDollarBigInt(futureDebt, collateralInfo.decimals, collateralInfo.displayDecimals),
    health: formatNumber(etherValueToNumber(health), 2),
    ltv: formatNumber(collateralValueToNumber(ltv || 0), 2) + "%",
    maxBorrowable: formatDollarBigInt(maxBorrowable, collateralInfo.decimals, 0),
    maxWithdrawable: formatDollarBigInt(maxWithDrawable, collateralInfo.decimals, 0),
  } as TgUsdMarketLoanDisplayData
}

export async function loadMarketServerData(collateral: ExistingAsset) {
  const tokenInfos = await getAssetInfo([collateral, "tgUSD"])
  const marketInfo = tgUsdMarkets.find((market) => market.marketName === collateral)
  const collateralInfo = tokenInfos.at(0)
  const tgUSDInfo = tokenInfos.at(1)
  return { collateralInfo, tgUSDInfo, marketInfo }
}

export function getMarketDisplayData(marketData?: MarketDetailData, collateralInfo?: AssetDataPriced) {
  if (!marketData || !collateralInfo)
    return {
      tvl: "-",
      borrowed: "-",
      cap: "-",
      deposited: "-",
      collateralValue: "-",
      debt: "-",
      health: "-",
      ltv: "-",
      maxBorrowable: "-",
      maxWithdrawable: "-",
      depositedDollar: "-",
      tvlDollar: "-",
      borrowRateCurrent: "-",
      borrowRateNext: "-",
      lt: "-",
      ltDollar: "-",
      maxLtv: "-",
      maxLtvDollar: "-",
      rewardsCutCurrent: "-",
      rewardsCutNext: "-",
    } as TgUsdMarketDisplayData

  const loanData = getComputedFutureLoanData(marketData, collateralInfo, { borrowWeiValue: 0n, depositWeiValue: 0n })
  return {
    ...loanData,
    tvl: formatNumber(Number(formatEther(BigInt(marketData?.collateralInfos?.totalCollateralAmount || 0n))), 0),
    tvlDollar: formatDollar(Number(formatEther(BigInt(marketData?.collateralInfos?.totalCollateralUSDValue || 0n))), 0),
    borrowed: formatDollar(Number(formatEther(BigInt(marketData?.debtInfos?.totalDebt || 0n))), 0),
    cap: formatDollar(Number(formatEther(BigInt(marketData?.constants.maxMarketDebt || 0n))), 2),
    deposited: formatNumber(Number(formatEther(BigInt(marketData?.collateralInfos.positionCollateralAmount || 0n))), 0),
    depositedDollar: formatDollar(Number(formatEther(BigInt(marketData?.collateralInfos.positionCollateralUSDValue || 0n))), 0),
    borrowRateCurrent: formatNumber(Number(formatEther(BigInt(marketData?.debtInfos.currentBorrowRate || 0n))), 2) + "%",
    borrowRateNext: formatNumber(Number(formatEther(BigInt(marketData?.debtInfos.futureBorrowRate || 0n))), 2) + "%",
    lt: formatNumber(Number(formatEther(BigInt(marketData?.constants.liquidationThreshold || 0n))), 2) + "%",
    ltDollar: "-",
    maxLtv: formatNumber(Number(BigInt(marketData?.constants.maxLTV || 0n)), 2) + "%",
    maxLtvDollar: formatDollar(Number(formatEther(BigInt(marketData?.constants.maxMarketDebt || 0n))), 2),
    rewardsCutCurrent: formatNumber(Number(formatEther(BigInt(marketData?.debtInfos.currentRewardCut || 0n))), 2) + "%",
    rewardsCutNext: formatNumber(Number(formatEther(BigInt(marketData?.debtInfos.futureRewardCut || 0n))), 2) + "%",
  } as TgUsdMarketDisplayData
}

export function getMarketApr(marketAddress: Address) {
  return {
    actualsApr: {
      details: { baseApr: 0.03, boostApr: 0.02, type: "variable" },
      totalApr: 2.5,
    },
    projectedApr: {
      details: { baseApr: 0.03, boostApr: 0.02, type: "variable" },
      totalApr: 4,
    },
    boostsData: {},
    marketAddress,
  }
}
