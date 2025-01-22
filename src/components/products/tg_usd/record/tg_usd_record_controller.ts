import { Abi, Address, formatEther, Hex, parseEther, zeroAddress } from "viem"
import { ChainViewMarketRow, MarketDetailData } from "../tg_usd_type"
import { executeChainViewUnique } from "@/services/service_rpc"
import MarketDetailsUI from "@/abi/tgusd/MarketDetailsUI.json"
import { AssetDataPriced } from "@/types"

export const getTgUsdMarketRecordData = async (address: Address | undefined, market: Address) => {
  address = address || zeroAddress
  return await executeChainViewUnique<ChainViewMarketRow>(MarketDetailsUI.abi as Abi, MarketDetailsUI.bytecode as Hex, [address, market])
}

export const transformMarketData = (onChainData: ChainViewMarketRow, collateralInfo: AssetDataPriced): MarketDetailData => {
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
  }
}

export function getBorrowState(marketData?: MarketDetailData, depositWeiValue?: bigint, borrowWeiValue?: bigint) {
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
