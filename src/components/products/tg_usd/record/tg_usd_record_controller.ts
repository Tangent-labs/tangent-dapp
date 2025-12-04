import {
  BalanceAllowanceData,
  ChainViewMarketRow,
  IrParams,
  MarketDetailData,
  MarketHistoricalData,
  USGMarketDisplayData,
  USGMarketLoanDisplayData,
  TotalBorrow,
  ZapToken,
  MarketAPR,
} from "../tg_usd_type"

import GetBalances from "@/abi/USG/GetBalances.json"
import { CollateralInfo, ExistingAsset } from "@/types"
import { getSwapAssetPrice } from "@/services/service_price"
import MarketDetailsUI from "@/abi/USG/MarketDetailsUI.json"
import { USGMarkets, USGOracles } from "../tg_usd_repository"
import GetBalancesAllowances from "@/abi/USG/GetBalancesAllowances.json"
import { executeApprove, executeChainViewUnique, waitForTransaction } from "@/services/service_rpc"
import { formatBigInt, formatDollar, formatDollarBigInt, formatNumber } from "@/lib/number_formatter"
import { Abi, Address, formatEther, formatUnits, Hex, parseEther, WalletClient, zeroAddress } from "viem"

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
  const txHash = await executeApprove(walletClient, contract, spender, amount)
  return await waitForTransaction(txHash)
}

export const getUSGMarketRecordData = async (address: Address, market: Address) => {
  return await executeChainViewUnique<ChainViewMarketRow>(MarketDetailsUI.abi as Abi, MarketDetailsUI.bytecode as Hex, [address, market])
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

export function getBorrowCommonFormState(marketData?: MarketDetailData, borrowWeiValue?: bigint) {
  const reasons: string[] = []

  if (!borrowWeiValue || borrowWeiValue === 0n) {
    reasons.push("Amount must be greater than zero.")
  } else {
    const minLoan = BigInt(marketData?.constants?.minimumLoan || "0")
    const totalDebt = marketData?.debtInfos?.totalDebt || 0n

    if (borrowWeiValue + totalDebt < minLoan) {
      reasons.push(`Min debt is ${formatEther(minLoan)} USG`)
    } else if (BigInt(marketData?.debtInfos?.userDebt || 0n) + BigInt(borrowWeiValue || 0n) > (marketData?.constants?.maxMarketDebt || 0n)) {
      reasons.push("Max market debt reached.")
    }
  }
  return reasons
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
) {
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
    debt: futureDebt > 0n ? formatBigInt(futureDebt, collateralInfo.decimals, collateralInfo.displayDecimals) : "0",
    health: health > 0n ? formatNumber(etherValueToNumber(health), 2) : "0",
    ltv: ltv > 0 ? formatNumber(collateralValueToNumber(ltv || 0), 2) + "%" : "0%",
    maxBorrowable: formatDollarBigInt(maxBorrowable, collateralInfo.decimals, 0),
    maxWithdrawable: formatDollarBigInt(maxWithDrawable, collateralInfo.decimals, 0),
  } as USGMarketLoanDisplayData
}

export async function loadMarketServerData(collateral: string) {
  const marketInfo = USGMarkets.find((market) => market.marketName === collateral)
  const collateralInfo = {
    address: USGMarkets.find((market) => market.marketName === collateral)?.collatAddress as Address,
    decimals: 18,
    displayDecimals: 2,
    symbol: collateral,
    name: collateral,
    logo: collateral as ExistingAsset,
    price: 0,
  }

  return { collateralInfo, marketInfo }
}

export function getMarketDisplayData(usgPrice: number, marketData?: MarketDetailData, collateralInfo?: CollateralInfo) {
  if (!marketData || !collateralInfo || !usgPrice)
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

  return {
    ...loanData,
    tvl: formatNumber(Number(formatEther(BigInt(marketData?.collateralInfos?.totalCollateralAmount || 0n))), 0),
    tvlDollar: formatDollar(Number(formatEther(BigInt(marketData?.collateralInfos?.totalCollateralUSDValue || 0n))), 0),
    borrowed: formatDollar(Number(formatEther(BigInt(marketData?.debtInfos?.totalDebt || 0n))), 0),
    cap: formatDollar(Number(formatEther(BigInt(marketData?.constants.maxMarketDebt || 0n))), 2),
    deposited: formatNumber(Number(formatEther(BigInt(marketData?.collateralInfos.positionCollateralAmount || 0n))), 0),
    depositedDollar: formatDollar(Number(formatEther(BigInt(marketData?.collateralInfos.positionCollateralUSDValue || 0n))), 0),
    borrowRateCurrent: Number(formatEther(marketData?.debtInfos.currentBorrowRate || 0n)),
    borrowRateNext: Number(formatEther(marketData?.debtInfos.futureBorrowRate || 0n)),
    lt: formatNumber(Number(formatEther(BigInt(marketData?.constants.liquidationThreshold || 0n))), 2) + "%",
    ltDollar: "-",
    maxLtv: formatNumber(Number(BigInt(marketData?.constants.maxLTV || 0n)) / 1000, 2) + "%",
    maxLtvDollar: formatDollar(Number(formatEther(BigInt(marketData?.constants.maxMarketDebt || 0n))), 2),
    rewardsCutCurrent: formatNumber(Number(marketData?.debtInfos.currentRewardCut || 0n) / 1000, 0) + "%",
    rewardsCutNext: formatNumber(Number(marketData?.debtInfos.futureRewardCut || 0n) / 1000, 0) + "%",
  } as USGMarketDisplayData
}

export const computeSwapAssetPrice = async (tokens: ZapToken[], depositAsset: string) => {
  let tokenAddress

  try {
    if (depositAsset === "ETH") {
      tokenAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address
    } else {
      tokenAddress = tokens.find((el: ZapToken) => el.name === depositAsset || el.symbol === depositAsset)
        ? tokens.find((el: ZapToken) => el.name === depositAsset || el.symbol === depositAsset)?.address
        : undefined
    }

    if (tokenAddress) {
      const data = await getSwapAssetPrice(tokenAddress)
      return data
    } else return null
  } catch (error) {
    console.error("Failed to compute swap asset price:", error)
    return null
  }
}

export const computeMaxBorrowable = (maxBorrowable: bigint, maxMarketDebt: bigint, totalDebt: bigint) => {
  if (maxBorrowable < maxMarketDebt - totalDebt) {
    return maxBorrowable > 0n ? maxBorrowable : 0n
  }
  return maxMarketDebt - totalDebt
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
      result = (totalCollateralAmount * collatVApr - userDebt * debtRate) / initialCollatAmountBigInt
    } else {
      result = (collatVApr * collatAmount - userDebt * debtRate + debtFarmingBigInt * debtVAPRBigInt) / collatAmount
    }

    const vAPR = Number(result) * 100

    if (!isFinite(vAPR)) {
      return 0
    }
    return vAPR
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

export const computeAprVariation = (marketAprs: MarketAPR[], currentConvexTVL: bigint, marketData: MarketDetailData, inputValue: bigint) => {
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
  return (futureDebt * 10n ** 18n) / ((futureCollat || 1n) * (ltRaw / BigInt(1000n)))
}

export const computedMinAmountOut = (value: bigint, slippage: number) => {
  return (BigInt(value) * (BigInt(10000 - Math.round(slippage * 100)) / 100n)) / BigInt(100)
}

// Markets contracts

type MarketContract = { name: string; address: Address }

const MARKET_CONTRACTS: Record<string, MarketContract[]> = {
  "crvUSD-USDC": [
    {
      name: "Market",
      address: USGMarkets.find((el) => el.marketName === "crvUSD-USDC")?.marketAddress as Address,
    },
    {
      name: "Collateral Token",
      address: USGMarkets.find((el) => el.marketName === "crvUSD-USDC")?.collatAddress as Address,
    },
    {
      name: "Oracle",
      address: USGOracles.find((el) => el.token === "crvUSD-USDC")?.address as Address,
    },
  ],

  "crvUSD-USDT": [
    {
      name: "Market",
      address: "0x380655A1bc784Bdc9dbC8C95D7D9A97dfb261068" as Address,
    },
    {
      name: "Collateral Token",
      address: "0x390f3595bCa2Df7d23783dFd126427CCeb997BF4" as Address,
    },
    {
      name: "Reward Distributor",
      address: "0x0000000000000000000000000000000000000003" as Address,
    },
    {
      name: "Oracle",
      address: "0x0000000000000000000000000000000000000004" as Address,
    },
  ],

  USDC_USDT: [
    {
      name: "Market",
      address: "0x627527004E78A024a9a74b425f6bd3B7CB94DD2f" as Address,
    },
    {
      name: "Collateral Token",
      address: "0x4f493b7de8aac7d55f71853688b1f7c8f0243c85" as Address,
    },
    {
      name: "Reward Distributor",
      address: "0x0000000000000000000000000000000000000005" as Address,
    },
    {
      name: "Oracle",
      address: "0x0000000000000000000000000000000000000006" as Address,
    },
  ],

  frxUSD_USDe: [
    {
      name: "Market",
      address: "0xf05262E0D9849b5052baa5A0BB638d21255D9CeB" as Address,
    },
    {
      name: "Collateral Token",
      address: "0xdbb1d219d84eacefb850ee04cacf2f1830934580" as Address,
    },
    {
      name: "Reward Distributor",
      address: "0x0000000000000000000000000000000000000007" as Address,
    },
    {
      name: "Oracle",
      address: "0x0000000000000000000000000000000000000008" as Address,
    },
  ],

  frxETH_WETH: [
    {
      name: "Market",
      address: "0x30Be42f8d46D34cB3F1455A8AbFd68119DF57C32" as Address,
    },
    {
      name: "Collateral Token",
      address: "0x9c3b46c0ceb5b9e304fcd6d88fc50f7dd24b31bc" as Address,
    },
    {
      name: "Reward Distributor",
      address: "0x0000000000000000000000000000000000000009" as Address,
    },
    {
      name: "Oracle",
      address: "0x000000000000000000000000000000000000000A" as Address,
    },
  ],

  pxETH_WETH: [
    {
      name: "Market",
      address: "0xD0dF1d131B177891ecd68Ee4d75f85b5f4344E50" as Address,
    },
    {
      name: "Collateral Token",
      address: "0xC8Eb2Cf2f792F77AF0Cd9e203305a585E588179D" as Address,
    },
    {
      name: "Reward Distributor",
      address: "0x000000000000000000000000000000000000000B" as Address,
    },
    {
      name: "Oracle",
      address: "0x000000000000000000000000000000000000000C" as Address,
    },
  ],

  pxETH_stETH: [
    {
      name: "Market",
      address: "0xb7533586217DB24b6E3c5B07CC26b4071aA15E6a" as Address,
    },
    {
      name: "Collateral Token",
      address: "0x6951bdc4734b9f7f3e1b74afebc670c736a0edb6" as Address,
    },
    {
      name: "Reward Distributor",
      address: "0x000000000000000000000000000000000000000D" as Address,
    },
    {
      name: "Oracle",
      address: "0x000000000000000000000000000000000000000E" as Address,
    },
  ],

  USDC_fxUSD: [
    {
      name: "Market",
      address: "0xc5b4ee8e284dB5182f604a5C125b2430d24a6cea" as Address,
    },
    {
      name: "Collateral Token",
      address: "0x5018BE882DccE5E3F2f3B0913AE2096B9b3fB61f" as Address,
    },
    {
      name: "Reward Distributor",
      address: "0x000000000000000000000000000000000000000F" as Address,
    },
    {
      name: "Oracle",
      address: "0x0000000000000000000000000000000000000010" as Address,
    },
  ],

  "USDe 27/11/25": [
    {
      name: "Market",
      address: "0x128C0F20dAcea6152F46e83E69122f2504A0FDeB" as Address,
    },
    {
      name: "Collateral Token",
      address: "0x62c6e813b9589c3631ba0cdb013acdb8544038b7" as Address,
    },
    {
      name: "Reward Distributor",
      address: "0x0000000000000000000000000000000000000011" as Address,
    },
    {
      name: "Oracle",
      address: "0x0000000000000000000000000000000000000012" as Address,
    },
  ],

  "sUSDe 27/11/25": [
    {
      name: "Market",
      address: "0xfB2Db1994D24f7bCB37228801ba35e22Aa33d2Ce" as Address,
    },
    {
      name: "Collateral Token",
      address: "0xe6a934089bbee34f832060ce98848359883749b3" as Address,
    },
    {
      name: "Reward Distributor",
      address: "0x0000000000000000000000000000000000000013" as Address,
    },
    {
      name: "Oracle",
      address: "0x0000000000000000000000000000000000000014" as Address,
    },
  ],
}

export const fetchMarketContracts = (name: string): MarketContract[] => {
  return MARKET_CONTRACTS[name] ?? []
}
