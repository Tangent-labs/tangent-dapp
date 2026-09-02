"use client"
import {
  BalanceAllowanceData,
  ChainViewMarketRow,
  IrParams,
  MarketDetailData,
  MarketHistoricalData,
  USGMarketDisplayData,
  USGMarketLoanDisplayData,
  TotalBorrow,
  MarketAPRs,
  FormError,
  RCParams,
} from "../usg_type"

import { parseAPRDetails } from "@/lib/apr"
import { Erc20Details, ERC20S } from "@/data/erc20s"
import GetBalances from "@/abi/USG/GetBalances.json"
import { AssetDataPriced, CollateralInfo } from "@/types"
import { getSwapAssetPrice } from "@/services/service_price"
import MarketDetailsUI from "@/abi/USG/MarketDetailsUI.json"
import { USG_CONTRACT, USGMarkets, USGOracles } from "../usg_repository"
import GetBalancesAllowances from "@/abi/USG/GetBalancesAllowances.json"
import { dappErrors } from "@/components/design_system/notifications/form-errors"
import { executeApprove, executeChainViewUnique, waitForTransaction } from "@/services/service_rpc"
import { Abi, Address, formatEther, formatUnits, Hex, parseEther, parseUnits, WalletClient, zeroAddress } from "viem"
import { formatBigInt, formatBigIntAsNumber, formatBigIntFloor, formatDollar, formatDollarBigInt, formatNumber } from "@/lib/number_formatter"

const DENOMINATOR = 100_000n
const DECIMALS = BigInt(10 ** 18)

const BORROW_BUFFER = BigInt(10 ** 16)

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
  const txHash = await executeApprove(walletClient, contract, spender, amount)
  return await waitForTransaction(txHash)
}

export const getUSGMarketRecordData = async (address: Address, market: Address) => {
  return await executeChainViewUnique<ChainViewMarketRow>(MarketDetailsUI.abi as Abi, MarketDetailsUI.bytecode as Hex, [
    address,
    market,
    USG_CONTRACT.MARKET_VIEWER,
    USG_CONTRACT.USG,
  ])
}

export const transformMarketData = (onChainData: ChainViewMarketRow, collateralInfo: CollateralInfo): MarketDetailData => {
  const staticMarketData = USGMarkets.find((m) => m.marketAddress === onChainData.marketAddress)
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

export function getBorrowCommonFormState(marketData?: MarketDetailData, borrowWeiValue?: bigint): FormError[] {
  const errors: FormError[] = []

  if (!borrowWeiValue || borrowWeiValue === 0n) {
    errors.push(dappErrors["empty-form"])
  } else {
    const minLoan = BigInt(marketData?.constants?.minimumLoan || "0")
    const userDebt = marketData?.debtInfos?.userDebt || 0n
    const totalDebt = marketData?.debtInfos?.totalDebt || 0n

    if (borrowWeiValue + userDebt < minLoan) {
      errors.push({
        key: "min-debt",
        title: "Below Minimum Debt",
        subtitle: `Minimum debt is ${formatBigIntAsNumber(minLoan, 18, 0)} USG.`,
        content: "Please increase your borrow amount to meet the minimum debt requirement.",
        type: "form-alert",
      })
    } else if (totalDebt + BigInt(borrowWeiValue || 0n) > (marketData?.constants?.maxMarketDebt || 0n)) {
      errors.push(dappErrors["max-market-debt"])
    }
  }

  return errors
}

export function getComputedFutureLoanData(
  usgPrice: number,
  marketData: MarketDetailData,
  collateralInfo?: CollateralInfo,
  amounts?: {
    depositWeiValue?: bigint
    borrowWeiValue?: bigint
    withdrawWeiValue?: bigint
    repayWeiValue?: bigint
    zapValue?: bigint
    liquidateValue?: bigint
  }
): USGMarketLoanDisplayData {
  amounts = { ...{ borrowWeiValue: 0n, repayWeiValue: 0n, depositWeiValue: 0n, withdrawWeiValue: 0n, zapValue: 0n, liquidateValue: 0n }, ...(amounts || {}) }

  if (!marketData || !collateralInfo || !usgPrice)
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
    debt: futureDebt > 0n ? formatBigInt(futureDebt, 18, collateralInfo.displayDecimals) : "0",
    health: health > 0n ? formatNumber(Number(formatUnits(health, collateralInfo.decimals)), 2) : "0",
    ltv: ltv > 0 ? formatNumber(Number(formatUnits(BigInt(Math.trunc(ltv)), 18)), 2) + "%" : "0%",
    maxBorrowable: formatDollarBigInt(maxBorrowable, collateralInfo.decimals, 0),
    maxWithdrawable: formatDollarBigInt(maxWithDrawable, collateralInfo.decimals, 0),
  }
}

export function getMarketDisplayData(usgPrice: number, marketData?: MarketDetailData, collateralInfo?: CollateralInfo) {
  if (!marketData || !collateralInfo || !usgPrice)
    return {
      tvl: "-",
      borrowed: "-",
      cap: "-",
      available: "-",
      deposited: "-",
      collateralValue: "-",
      debt: "-",
      health: "-",
      ltv: "-",
      maxBorrowable: "-",
      maxWithdrawable: "-",
      depositedDollar: "-",
      tvlDollar: "-",
      borrowRateCurrent: 0,
      borrowRateNext: 0,
      lt: "-",
      ltDollar: "-",
      maxLtv: "-",
      maxLtvDollar: "-",
      rewardsCutCurrent: "-",
      rewardsCutNext: "-",
    } as USGMarketDisplayData

  const loanData = getComputedFutureLoanData(usgPrice, marketData!, collateralInfo, { borrowWeiValue: 0n, depositWeiValue: 0n })

  const rawAvailable = marketData.constants.maxMarketDebt - marketData.debtInfos.totalDebt
  const flooredAvailable = rawAvailable >= BigInt(10 ** 18) ? rawAvailable : 0n

  return {
    ...loanData,
    tvl: formatNumber(Number(formatEther(BigInt(marketData?.collateralInfos?.totalCollateralAmount || 0n))), 0),
    tvlDollar: formatEther(BigInt(marketData?.collateralInfos?.totalCollateralUSDValue || 0n)),
    borrowed: formatNumber(Number(formatEther(BigInt(marketData?.debtInfos?.totalDebt || 0n))), 0) + " USG",
    cap: formatNumber(Number(formatEther(BigInt(marketData?.constants.maxMarketDebt || 0n))), 0) + " USG",
    available: formatNumber(Number(formatEther(flooredAvailable)), 0) + " USG",
    deposited: formatNumber(Number(formatEther(BigInt(marketData?.collateralInfos.positionCollateralAmount || 0n))), 0),
    depositedDollar: formatDollar(Number(formatEther(BigInt(marketData?.collateralInfos.positionCollateralUSDValue || 0n))), 0),
    borrowRateCurrent: Number(formatEther(marketData?.debtInfos.currentBorrowRate || 0n)),
    borrowRateNext: Number(formatEther(marketData?.debtInfos.futureBorrowRate || 0n)),
    lt: formatNumber(Number(formatUnits(BigInt(marketData?.constants.liquidationThreshold || 0n), 3)), 2) + "%",
    ltDollar: "-",
    maxLtv: formatNumber(Number(BigInt(marketData?.constants.maxLTV || 0n)) / 1000, 2) + "%",
    maxLtvDollar: formatDollar(Number(formatEther(BigInt(marketData?.constants.maxMarketDebt || 0n))), 2),
    rewardsCutCurrent: (Number(marketData?.debtInfos.currentRewardCut || 0n) / 1000).toFixed(2) + "%",
    rewardsCutNext: (Number(marketData?.debtInfos.futureRewardCut || 0n) / 1000).toFixed(2) + "%",
  } as USGMarketDisplayData
}

export const computeSwapAssetPrice = async (depositAsset: string, usgPrice: bigint, sUSGPrice: bigint) => {
  if (depositAsset === "USG") {
    return Number(formatEther(usgPrice))
  } else if (depositAsset === "sUSG") {
    return Number(formatEther(sUSGPrice))
  }
  // Remove prefixes
  const lpName = depositAsset.replace("Gauge ", "").replace("Vault ", "")
  const token = ERC20S.find((el: Erc20Details) => el.name === lpName || el.symbol === depositAsset)
  const tokenAddress = token ? token?.address : undefined

  try {
    if (tokenAddress) {
      const data = await getSwapAssetPrice(tokenAddress)
      return data
    } else return null
  } catch (error) {
    console.error("Failed to compute swap asset price:", error)
    return null
  }
}

/**
 *  If maxBorrowable is within the global market debt cap and > $0.01 return it with a 0.05% margin (or return 0 if < $0.01)
 *  Else return the remaining borrowable debt.
 * @returns
 */
export const computeMaxBorrowable = (maxBorrowable: bigint, maxMarketDebt: bigint, totalDebt: bigint) => {
  if (maxBorrowable < maxMarketDebt - totalDebt) {
    return maxBorrowable > BORROW_BUFFER ? (maxBorrowable * 9995n) / 10000n : 0n
  }
  return ((maxMarketDebt - totalDebt) / 10n ** 18n) * 10n ** 18n
}

export const computeRewardsCut = (USGPrice: bigint, rcParams: RCParams) => {
  const stepAmount = rcParams.stepAmount
  const startCutPrice = rcParams.startCutPrice * BigInt(10 ** 12)
  const endCutPrice = rcParams.endCutPrice * BigInt(10 ** 12)
  const USGPriceScaled = USGPrice as bigint

  if (stepAmount === 1) {
    return rcParams.startCutPercentage
  } else if (stepAmount === 2) {
    if (USGPriceScaled >= startCutPrice) {
      return rcParams.startCutPercentage
    } else {
      return rcParams.endCutPercentage
    }
  } else {
    if (USGPriceScaled >= startCutPrice) {
      return rcParams.startCutPercentage
    }
    if (USGPriceScaled <= endCutPrice) {
      return rcParams.endCutPercentage
    }

    const actualStep = BigInt(1) + (BigInt(stepAmount - 2) * (startCutPrice - USGPriceScaled)) / (startCutPrice - endCutPrice)

    return BigInt(rcParams.startCutPercentage) + (BigInt(actualStep) * BigInt(rcParams.endCutPercentage - rcParams.startCutPercentage)) / BigInt(stepAmount - 1)
  }
}

/**
 * Here the idea is that for HEC markets we need to recompute the price dependent RC and apply it to every rewards component.
 * For this we need to isolate the rewards component, remove the currently applied RC and apply the price dependent projected one.
 */
export const computeHECvAPR = (currentTotalMarketApr: number, marketAprs: MarketAPRs, price: number, rcParams: RCParams, currentRC: number) => {
  if (!marketAprs?.currentAPR) return 0n

  const { baseAPY } = parseAPRDetails(marketAprs.currentAPR)
  const base = baseAPY || 0
  const rewardsAPR = currentTotalMarketApr - base

  // Remove the RC currently live in production and apply the projected "price dependent" one.
  const projectedRC = Number(formatUnits(computeRewardsCut(parseUnits(price.toFixed(6), 18), rcParams), 5))
  const totalCurrentAPR = base + (rewardsAPR / (1 - currentRC)) * (1 - projectedRC)

  return BigInt(Math.round(totalCurrentAPR * 10 ** 18)) / BigInt(100)
}

export const computeIR = (USGPrice: bigint, irParams: IrParams) => {
  const USGPriceNumber = Number(formatUnits(USGPrice, 18))
  const normalizedPMin = Number(formatUnits(BigInt(irParams.pMin), 6))
  const normalizedPMax = Number(formatUnits(BigInt(irParams.pMax), 6))

  if (USGPriceNumber <= normalizedPMin) {
    const ir = Number(formatUnits(BigInt(irParams.rMax), 5))
    const adjustedIR = Math.exp(ir) - 1
    return parseEther(adjustedIR.toFixed(18))
  }
  if (USGPriceNumber >= normalizedPMax) {
    if (irParams.isHEC) {
      const ir = 0
      const adjustedIR = Math.exp(ir) - 1
      return parseEther(adjustedIR.toFixed(18))
    }
    const ir = Number(formatUnits(BigInt(irParams.rMin), 5))
    const adjustedIR = Math.exp(ir) - 1
    return parseEther(adjustedIR.toFixed(18))
  }
  const priceDelta = USGPriceNumber - Number(formatUnits(BigInt(irParams.pInf), 6))

  const sigmaX = Number(irParams.k) * priceDelta

  const exp = Math.exp(-sigmaX)

  const sigma = 1 / (1 + exp)

  const alpha1 = Number(irParams.a1) / 1_000
  const alpha = alpha1 + (Number(irParams.a2) / 1_000 - alpha1) * sigma

  const quotient = (normalizedPMax - USGPriceNumber) / (normalizedPMax - normalizedPMin)

  const priceRatio = quotient ** alpha

  const irIncrement = Number(formatUnits(BigInt(irParams.rMax) - BigInt(irParams.rMin), 5)) * priceRatio

  const ir = Number(formatUnits(BigInt(irParams.rMin), 5)) + irIncrement

  const adjustedIR = Math.exp(ir) - 1

  return parseEther(adjustedIR.toFixed(18))
}

export const computeVAPR = (
  collatVApr: bigint,
  collatAmount: bigint,
  userDebt: bigint,
  debtRate: bigint,
  debtFarmingAmount: number,
  debtFarmingVApr: number,
  totalCollateralAmount: bigint,
  isLeveraged: boolean,
  initialCollatAmount?: number
) => {
  try {
    const debtFarmingBigInt = BigInt(debtFarmingAmount * 10 ** 18)
    const debtVAPRBigInt = BigInt(debtFarmingVApr * 10 ** 18)
    const initialCollatAmountBigInt = BigInt((initialCollatAmount || 1) * 10 ** 18)

    let result: bigint
    if (isLeveraged && initialCollatAmountBigInt) {
      result = (totalCollateralAmount * collatVApr - userDebt * debtRate + debtFarmingBigInt * debtVAPRBigInt) / initialCollatAmountBigInt
    } else {
      result = (collatVApr * collatAmount - userDebt * debtRate + debtFarmingBigInt * debtVAPRBigInt) / collatAmount
    }

    const vAPR = result * 100n

    if (!isFinite(Number(vAPR))) {
      return 0
    }
    return Number(formatBigInt(vAPR, 18, 3))
  } catch {
    return 0
  }
}

export const mapToTotalBorrow = (rows: MarketHistoricalData[]): TotalBorrow => {
  if (!rows || rows.length === 0) {
    return { latestTotalDebt: "0", data: [] }
  }

  const latest = rows.reduce((acc, cur) => (Date.parse(cur.timestamp) > Date.parse(acc.timestamp) ? cur : acc))

  const data = rows
    .slice()
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
    .map((r) => ({
      timestamp: r.timestamp,
      value: r.total_debt.toFixed(0),
    }))

  return {
    latestTotalDebt: latest.total_debt.toFixed(0),
    data,
  }
}

export const computeAprVariation = (marketAprs: MarketAPRs[], currentConvexTVL: bigint, marketData: MarketDetailData, inputValue: bigint) => {
  let result = { current: "", currentUpdated: "-", projected: "", projectedUpdated: "-" }

  const currentMarketApr = marketAprs.find((m) => m.marketAddress.toLowerCase() === marketData?.marketAddress.toLowerCase())

  if (currentMarketApr) {
    const { APY: currentAPY, ...currentAPRWithoutApy } = currentMarketApr?.currentAPR
    const { APY: projectedAPY, ...projectedAPRWithoutApy } = currentMarketApr?.projectedAPR

    const totalCurrentAPR = Object.values(currentMarketApr?.currentAPR).reduce((sum, value) => Number(sum) + Number(value), 0) as number
    const totalProjectedAPR = Object.values(currentMarketApr?.projectedAPR).reduce((sum, value) => Number(sum) + Number(value), 0) as number

    const totalCurrentAPRWithoutAPY = Object.values(currentAPRWithoutApy).reduce((sum, value) => Number(sum) + Number(value), 0) as number
    const totalProjectedAPRWithoutAPY = Object.values(projectedAPRWithoutApy).reduce((sum, value) => Number(sum) + Number(value), 0) as number

    const newAPR =
      (marketData?.collateralInfos.totalCollateralUSDValue * BigInt((totalCurrentAPRWithoutAPY * 100).toFixed(0))) /
      (marketData?.collateralInfos.totalCollateralUSDValue + inputValue || 1n)

    const newProjectedAPR = (currentConvexTVL * BigInt((totalProjectedAPRWithoutAPY * 100).toFixed(0))) / (currentConvexTVL + inputValue)

    if (newAPR >= 0n && currentAPY >= 0 && newProjectedAPR >= 0 && projectedAPY >= 0) {
      result = {
        current: `${totalCurrentAPR.toFixed(2)}%`,
        currentUpdated: `${(Number(newAPR) / 100 + currentAPY).toFixed(2)}%`,
        projected: `${totalProjectedAPR.toFixed(2)}%`,
        projectedUpdated: `${(Number(newProjectedAPR) / 100 + projectedAPY).toFixed(2)}%`,
      }
    } else {
      result = { current: `${totalCurrentAPR.toFixed(2)}%`, currentUpdated: "-", projected: `${totalProjectedAPR.toFixed(2)}%`, projectedUpdated: "-" }
    }
  }

  return result
}

/**
 * Computes the liquidation price in USD for the given market
 *
 */
export const computeLiquidationPrice = (
  collateralInfo: CollateralInfo,
  marketData: MarketDetailData,
  amounts?: {
    depositWeiValue?: bigint
    withdrawWeiValue?: bigint
    zapValue?: bigint
    liquidateValue?: bigint
    borrowWeiValue?: bigint
    repayWeiValue?: bigint
  }
): bigint => {
  const currentAmounts = {
    depositWeiValue: 0n,
    withdrawWeiValue: 0n,
    zapValue: 0n,
    liquidateValue: 0n,
    borrowWeiValue: 0n,
    repayWeiValue: 0n,
    ...(amounts || {}),
  }

  const futureDebt = marketData.debtInfos.userDebt + currentAmounts?.borrowWeiValue - currentAmounts?.repayWeiValue

  const futureCollat = !!BigInt(currentAmounts?.zapValue)
    ? marketData.collateralInfos.positionCollateralAmount + BigInt(currentAmounts.zapValue) - currentAmounts?.withdrawWeiValue - currentAmounts?.liquidateValue
    : marketData.collateralInfos.positionCollateralAmount + currentAmounts?.depositWeiValue - currentAmounts?.withdrawWeiValue - currentAmounts?.liquidateValue

  const ltRaw = marketData.constants.liquidationThreshold

  if (futureDebt <= 0n || futureCollat <= 0n) return 0n
  return (futureDebt * BigInt(10 ** collateralInfo?.decimals)) / ((futureCollat || 1n) * (ltRaw / BigInt(1000n)))
}

export const computedMinAmountOut = (value: bigint | string, slippagePercentage: number) => {
  const percentageToString = (slippagePercentage / 100).toFixed(4)
  const mul = parseUnits("1", 5) - parseUnits(percentageToString, 5)
  return (BigInt(value) * mul) / parseUnits("1", 5)
}

type MarketContract = { name: string; address: Address }

// Need to re-match token pairs before mapping contract addresses because of how duoPoolStable is set
const pairKey = (pair: string) =>
  pair
    .split("/")
    .map((token) => token.toLowerCase())
    .sort()
    .join("/")

const MARKET_CONTRACTS = Object.fromEntries(
  USGMarkets.map((market) => {
    const oracle = USGOracles.find((el) => pairKey(el.token) === pairKey(market.marketName))

    return [
      market.marketName,
      [
        { name: "Market", address: market.marketAddress as Address },
        { name: "Collateral Token", address: market.collatAddress as Address },
        { name: "Oracle", address: oracle?.address as Address },
        { name: "USG", address: USG_CONTRACT.USG },
        { name: "IR Calculator", address: USG_CONTRACT.IR_CALCULATOR },
      ],
    ]
  })
) as Record<string, MarketContract[]>

export const fetchMarketContracts = (name: string): MarketContract[] => {
  return MARKET_CONTRACTS[name] ?? []
}

export const computeTransactionPotentialLoss = (buyWeiValue: bigint, buyAssetInfo: AssetDataPriced | CollateralInfo, delta: number) => {
  try {
    if (buyWeiValue && buyAssetInfo) {
      const minAmountOutWei = computedMinAmountOut(buyWeiValue, delta)

      const tokenLossWei = BigInt(buyWeiValue) - minAmountOutWei
      const dollarLossWei = (tokenLossWei * BigInt(Math.round(Number(buyAssetInfo?.price?.toFixed(2)) * 10000))) / BigInt(10000n)

      const tokenLossTruncated = formatBigIntFloor(tokenLossWei, buyAssetInfo?.decimals || 18, buyAssetInfo?.displayDecimals)
      const dollarLossTruncated = formatBigIntFloor(dollarLossWei, buyAssetInfo?.decimals || 18, buyAssetInfo?.displayDecimals)

      const tokenLoss = `${formatNumber(Number(tokenLossTruncated), buyAssetInfo?.displayDecimals)}`
      const dollarLoss = `$${formatNumber(Number(dollarLossTruncated), buyAssetInfo?.displayDecimals)}`

      return { tokenLoss, dollarLoss }
    }
    return { tokenLoss: "", dollarLoss: "" }
  } catch {
    return { tokenLoss: "", dollarLoss: "" }
  }
}

export function matchBlockChainErrors(err: string) {
  if (err.includes("User denied transaction signature")) {
    return "User denied transaction signature."
  }
  if (err.includes("No swap route available")) {
    return "No swap route available for this asset?"
  }
}

const DEFAULT_DISPLAY_DECIMALS = 2

// How many decimals to show for a market's collateral amount.
export const getCollateralDisplayDecimals = (collatAddress: Address, marketName: string): number => {
  const meta = ERC20S.find((e) => e.address?.toLowerCase() === collatAddress.toLowerCase() || e.symbol === marketName || e.name === marketName)
  return meta?.displayDecimals ?? DEFAULT_DISPLAY_DECIMALS
}
