import { Abi, Address, formatEther, Hex, parseEther, zeroAddress } from "viem"
import { ChainViewMarketRow, MarketDetailData } from "../tg_usd_type"
import { executeChainViewUnique } from "@/services/service_rpc"
import MarketDetailsUI from "@/abi/tgusd/MarketDetailsUI.json"
import { AssetDataPriced, ExistingAsset } from "@/types"
import { tgUsdMarkets } from "../tg_usd_repository"
import { getAssetInfo } from "@/services/service_existing_asset"

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

export function getComputedLoanData(marketData?: MarketDetailData) {
  const depositedDollar = BigInt(marketData?.collateralInfos?.positionCollateralUSDValue || 0n)
  const existingDebt = BigInt(marketData?.debtInfos?.positionDebt || 0n)
  const maxLTV = BigInt(marketData?.constants.maxLTV || "0") / 1000n
  const minLoan = BigInt(marketData?.constants?.minimumLoan || "0")
  const maxBorrowable = (depositedDollar * maxLTV) / 100n - existingDebt
  const deposited = BigInt(marketData?.collateralInfos?.positionCollateralAmount || 0n)
  const maxWithDrawable = deposited - existingDebt - minLoan
  const maxMarketDebt = BigInt(marketData?.constants.maxMarketDebt || "0")
  const currentLtv = depositedDollar !== 0n ? (existingDebt * 100000n) / depositedDollar : 0n

  return { maxBorrowable, maxWithDrawable, maxLTV, maxMarketDebt, minLoan, currentLtv }
}

export async function loadMarketServerData(collateral: ExistingAsset) {
  const tokenInfos = await getAssetInfo([collateral, "tgUSD"])
  const marketInfo = tgUsdMarkets.find((market) => market.marketName === collateral)
  const collateralInfo = tokenInfos.at(0)
  const tgUSDInfo = tokenInfos.at(1)

  return { collateralInfo, tgUSDInfo, marketInfo }
}
