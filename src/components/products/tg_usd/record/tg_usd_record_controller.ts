import { Abi, Address, formatEther, formatUnits, Hex, WalletClient, zeroAddress } from "viem"
import { BalanceAllowanceData, ChainViewMarketRow, MarketDetailData, TgUsdMarketDisplayData, TgUsdMarketLoanDisplayData, ZapToken } from "../tg_usd_type"
import { executeAppove, executeChainViewUnique, waitForTransaction } from "@/services/service_rpc"
import MarketDetailsUI from "@/abi/tgusd/MarketDetailsUI.json"
import GetBalances from "@/abi/tgusd/GetBalances.json"
import { AssetDataPriced, ExistingAsset } from "@/types"
import { TGUSD_CONTRACT, tgUsdMarkets } from "../tg_usd_repository"
import { getAssetInfo } from "@/services/service_existing_asset"
import { formatDollar, formatDollarBigInt, formatNumber } from "@/lib/number_formatter"
import GetBalancesAllowances from "@/abi/tgusd/GetBalancesAllowances.json"
import { getSwapAssetPrice } from "@/services/service_price"
import { getEnsoData } from "../quote_api"

const DENOMINATOR = 100_000n
const DECIMALS = BigInt(10 ** 18)

export const getBalancesAndAllowances = async (walletClient: WalletClient, address: Address | undefined, spender: Address | undefined) => {
  address = address || zeroAddress
  const [account] = await walletClient.requestAddresses()

  return await executeChainViewUnique<BalanceAllowanceData[]>(GetBalancesAllowances.abi as Abi, GetBalancesAllowances.bytecode as Hex, [
    account,
    [{ token: address, spenders: [spender] }],
  ])
}

export const getBalances = async (user: Address, tokens: Address[]) => {
  return await executeChainViewUnique<bigint[]>(GetBalances.abi as Abi, GetBalances.bytecode as Hex, [user, tokens])
}

export async function doApprove(walletClient: WalletClient, contract: Address, spender: Address, amount: bigint) {
  const txHash = await executeAppove(walletClient, contract, spender, amount)
  return await waitForTransaction(txHash)
}

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
    sociabilization: onChainData?.sociabilization,
  }
}

export function getBorrowCommonFormState(marketData?: MarketDetailData, depositWeiValue?: bigint, borrowWeiValue?: bigint) {
  const reasons: string[] = []

  if (!borrowWeiValue || borrowWeiValue === 0n) {
    reasons.push("Amount must be greater than zero.")
  } else {
    const minLoan = BigInt(marketData?.constants?.minimumLoan || "0")
    const totalDebt = marketData?.debtInfos?.totalDebt || 0n

    if (borrowWeiValue + totalDebt < minLoan) {
      reasons.push(`Min debt is ${formatEther(minLoan)}`)
    } else {
      const depositedCollateral = marketData?.collateralInfos?.positionCollateralUSDValue || 0n
      const existingDebt = marketData?.debtInfos?.userDebt || 0n

      const maxLTV = (marketData?.constants.maxLTV || 0n) / BigInt(10000n)
      const maxMarketDebt = BigInt(marketData?.constants.maxMarketDebt || "0")
      const maxLoan = maxLTV * BigInt(depositWeiValue || 0n) + depositedCollateral
      if (maxLoan < borrowWeiValue + existingDebt) {
        reasons.push(`max debt is ${Number(formatUnits(maxLoan, 18)).toFixed(2)}`)
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
    zapValue?: bigint
    liquidateValue?: bigint
  }
) {
  amounts = { ...{ borrowWeiValue: 0n, repayWeiValue: 0n, depositWeiValue: 0n, withdrawWeiValue: 0n, zapValue: 0n, liquidateValue: 0n }, ...(amounts || {}) }

  if (!marketData || !collateralInfo)
    return {
      collateralValue: "-",
      debt: "-",
      health: "-",
      ltv: "-",
      maxBorrowable: "-",
      maxWithdrawable: "-",
    }

  const collateralValueToNumber = (value: bigint | number) => {
    const intValue = typeof value === "number" ? Math.round(value) : value
    return Number(formatUnits(BigInt(intValue), collateralInfo?.decimals || 18))
  }

  const etherValueToNumber = (value: bigint) => Number(formatEther(value))
  const collateralPriceRaw = BigInt(marketData?.collateralInfos?.collateralUSDPrice || 0n)
  const collateralprice = etherValueToNumber(collateralPriceRaw)
  const liquidationThresholdRaw = BigInt(marketData?.constants?.liquidationThreshold || 0n)

  const futureDebt = BigInt(marketData?.debtInfos?.userDebt || 0n) + BigInt(amounts.borrowWeiValue!) - BigInt(amounts.repayWeiValue!)

  const futureDeposited = !!amounts?.zapValue
    ? BigInt(marketData?.collateralInfos?.positionCollateralAmount || 0n) +
      BigInt(amounts.zapValue!) -
      BigInt(amounts.withdrawWeiValue!) -
      BigInt(amounts.liquidateValue!)
    : BigInt(marketData?.collateralInfos?.positionCollateralAmount || 0n) +
      BigInt(amounts.depositWeiValue!) -
      BigInt(amounts.withdrawWeiValue!) -
      BigInt(amounts.liquidateValue!)

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

export const computeSwapAssetPrice = async (tokens: ZapToken[], depositAsset: string) => {
  try {
    const tokenAddress = tokens.find((el: ZapToken) => el.name === depositAsset || el.symbol === depositAsset)
      ? tokens.find((el: ZapToken) => el.name === depositAsset || el.symbol === depositAsset)?.address
      : undefined
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
  amount: bigint,
  tokenIn: AssetDataPriced,
  tokenOut: AssetDataPriced,
  marketInfo: { marketAddress: Address },
  minAmountOut: bigint
) => {
  const routerCall = await getEnsoData(amount, tokenIn?.address, tokenOut?.address, TGUSD_CONTRACT.ZAPPER, marketInfo.marketAddress, minAmountOut)

  if (!routerCall?.tx?.data) throw new Error("Failed to fetch routing data")

  const zapMarketData = {
    tokenIn: tokenIn?.address,
    amountIn: amount,
    minAmountOut: 0n,
  }

  return { routerCallData: routerCall, zapMarketData }
}
