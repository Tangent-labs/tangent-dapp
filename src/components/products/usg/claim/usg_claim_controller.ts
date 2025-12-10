import { ClaimerInfo } from "../usg_type"
import { USG_CONTRACT, USGMarkets } from "../usg_repository"
import claimUI from "../../../../abi/USG/ClaimUI.json"
import { getTokensPrice } from "@/services/service_price"
import { Abi, Address, formatUnits, Hex, WalletClient } from "viem"
import claimContract from "../../../../abi/USG/RewardAccumulator.json"
import { AssetDataPriced, ExistingAsset, ListHeaderData } from "@/types"
import { assetConfig, AssetConfigKey } from "@/services/repo_asset_infos"
import { executeChainViewUnique, executeContractCall } from "@/services/service_rpc"

export async function doClaim(contractAddress: Address, markets: Address[], rewardsLength: number | undefined, walletClient: WalletClient) {
  const txData = {
    abi: claimContract.abi as Abi,
    functionName: markets.length === 1 ? "claimSimple" : "claimMultiple",
    args: markets.length === 1 ? [markets[0]] : [markets, rewardsLength],
    address: contractAddress,
    gas: undefined as undefined | bigint,
  }
  return await executeContractCall(walletClient, txData)
}

export async function getTgUsdClaimOnChainData(currentAddress: string) {
  const addresses: Address[] = USGMarkets.map((m) => m.marketAddress)
  return await executeChainViewUnique<ClaimerInfo[]>(claimUI.abi as Abi, claimUI.bytecode as Hex, [currentAddress, addresses, USG_CONTRACT.MARKET_VIEWER])
}

export const computeAndReturnPrices = async (claimInfo: ClaimerInfo[]) => {
  const tokensSet = new Set<ExistingAsset>()

  claimInfo.forEach((el) => {
    el.claimableTokens.forEach((t) => {
      if (t?.symbol) tokensSet.add(t.symbol)
    })

    tokensSet.add(el.collatStaked.symbol)
  })

  const tokens: ExistingAsset[] = Array.from(tokensSet)

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

export function transformClaimOnChainData(claimerInfos: ClaimerInfo[], assetInfos: AssetDataPriced[]) {
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

    const depositedValueInUsd = parseFloat(formatUnits(claimer.collatStakedUsdValue, Number(claimer.collatStaked.decimals)))

    const deposited = {
      symbol: claimer.collatStaked.symbol,
      amount: claimer.collatStaked.amount.toString(),
      valueInUsd: depositedValueInUsd.toFixed(2),
    }

    const marketName = claimer.collatStaked.symbol

    return {
      marketAddress: claimer.marketAddress,
      marketName,
      claimable,
      totalClaimableValue: totalClaimableValue.toFixed(2),
      deposited,
      totalDepositedValue: deposited.valueInUsd,
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
