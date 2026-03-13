import { ClaimerInfo, MarketAPRs } from "../usg_type"
import claimUI from "../../../../abi/USG/ClaimUI.json"
import { getTokensPrice } from "@/services/service_price"
import { USG_CONTRACT, USGMarkets } from "../usg_repository"
import { Abi, Address, formatUnits, Hex, WalletClient } from "viem"
import claimContract from "../../../../abi/USG/RewardAccumulator.json"
import { AssetDataPriced, ListHeaderData } from "@/types"
import { assetConfig, AssetConfigKey } from "@/services/repo_asset_infos"
import { executeChainViewUnique, executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { getRewardTokenFromAprDetails } from "../list/usg_market_controller"

export async function doClaim(contractAddress: Address, markets: Address[], rewardsLength: number | undefined, walletClient: WalletClient) {
  const txData = {
    abi: claimContract.abi as Abi,
    functionName: markets.length === 1 ? "claimSimple" : "claimMultiple",
    args: markets.length === 1 ? [markets[0]] : [markets, rewardsLength],
    address: contractAddress,
    gas: undefined as undefined | bigint,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export async function getUSGClaimOnChainData(currentAddress: string) {
  const addresses: Address[] = USGMarkets.map((m) => m.marketAddress)
  return await executeChainViewUnique<ClaimerInfo[]>(claimUI.abi as Abi, claimUI.bytecode as Hex, [currentAddress, addresses, USG_CONTRACT.MARKET_VIEWER])
}

export const computeAndReturnPrices = async (claimInfo: ClaimerInfo[]) => {
  const tokensSet = new Set<string>()

  claimInfo.forEach((el) => {
    el.claimableTokens.forEach((t) => {
      if (t?.symbol) tokensSet.add(t.symbol)
    })

    tokensSet.add(el.collatStaked.symbol)
  })

  const tokens: string[] = Array.from(tokensSet)

  try {
    const prices = await getTokensPrice(tokens)

    const allInfos = Object.entries(assetConfig)
      .filter(([assetSymbol]) => tokens.indexOf(assetSymbol as AssetConfigKey) !== -1)
      .map(([symbol, config]) => {
        return {
          ...config,
          price: (prices ? prices[symbol as AssetConfigKey] : 0) || 0,
        }
      })
      .sort((a, b) => {
        return (a?.logo ? tokens.indexOf(a.logo) : -1) - (b?.logo ? tokens.indexOf(b.logo) : -1)
      })

    return allInfos
  } catch (error) {
    console.error("Failed to load asset information:", error)
    return undefined
  }
}

export function transformClaimOnChainData(claimerInfos: ClaimerInfo[], assetInfos: AssetDataPriced[], marketAprs: MarketAPRs[]) {
  const getPriceBySymbol = (symbol: string): number => {
    const asset = assetInfos.find((info) => info.symbol === symbol)
    return asset ? asset.price : 0
  }

  const result = claimerInfos.map((claimer) => {
    const claimable = claimer.claimableTokens.map((token) => {
      const tokenPrice = getPriceBySymbol(token.symbol)

      const valueInUsd = Number(formatUnits(token.amount, Number(token.decimals))) * tokenPrice

      return {
        symbol: token.symbol,
        amount: token.amount.toString(),
        valueInUsd: valueInUsd.toFixed(2),
      }
    })

    const totalClaimableValue = claimable.reduce((sum, token) => sum + parseFloat(token.valueInUsd), 0)

    const depositedValueInUsd = parseFloat(formatUnits(claimer.collatStakedUsdValue, 18))

    const deposited = {
      symbol: claimer.collatStaked.symbol,
      amount: claimer.collatStaked.amount.toString(),
      valueInUsd: depositedValueInUsd.toFixed(2),
    }

    const marketConfig = USGMarkets.find((m) => m.marketAddress === claimer.marketAddress)

    const marketNameIsDuplicated = marketConfig != null && USGMarkets.filter((m) => m.marketName === marketConfig.marketName).length > 1

    // APR Computing Section
    let totalCurrentAPR = 0
    let totalProjectedAPR = 0
    let rewardToken = "CRV"

    const marketDataApr = marketAprs?.find((el) => el?.marketAddress?.toLowerCase() === marketConfig?.marketAddress?.toLowerCase())

    if (marketDataApr && marketDataApr?.currentAPR && marketDataApr?.projectedAPR) {
      totalCurrentAPR = Object.values(marketDataApr?.currentAPR).reduce((sum, value) => Number(sum) + Number(value), 0) as number
      totalProjectedAPR = Object.values(marketDataApr?.projectedAPR).reduce((sum, value) => Number(sum) + Number(value), 0) as number

      rewardToken = getRewardTokenFromAprDetails(marketDataApr?.currentAPR, marketConfig?.marketType || "Curve")
    }

    const displayName = (marketNameIsDuplicated && marketConfig?.marketType === "STAKEDAO_CRV_Vault" ? "s-" : "") + marketConfig?.marketName

    return {
      marketType: marketConfig?.marketType,
      marketAddress: claimer.marketAddress,
      marketName: displayName,
      claimable,
      totalClaimableValue: totalClaimableValue.toFixed(2),
      deposited,
      totalDepositedValue: deposited.valueInUsd,
      totalCurrentAPR,
      totalProjectedAPR,
      rewardToken,
      apr: {
        current: Number(totalCurrentAPR),
        projected: marketConfig?.marketType === "Pendle_PT" ? undefined : Number(totalProjectedAPR),
      },
      currentAPRDetails: marketDataApr?.currentAPR,
      projectedAPRDetails: marketDataApr?.projectedAPR,
    }
  })

  result.sort((marketA, marketB) => parseFloat(marketB.totalClaimableValue) - parseFloat(marketA.totalClaimableValue))

  return result
}

export const claimListHeaders: ListHeaderData[] = [
  { label: "Market", key: "marketName" },
  { label: "APR", key: "apr", sort: "sort" },
  { label: "Claimable", key: "totalClaimableValue", sort: "sort" },
  { label: "Deposited", key: "totalDepositedValue", sort: "sort" },
  { label: "", key: "" },
]
