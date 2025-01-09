import { executeChainViewUnique, executeContractCall } from "@/services/service_rpc"
import { Abi, Address, formatUnits, Hex, WalletClient } from "viem"
import { tgUsdMarkets } from "../tg_usd_repository"
import { ClaimerInfo } from "../tg_usd_type"
import claimUI from "@/abi/tgusd/ClaimUI.json"
import claimContract from "@/abi/tgusd/RewardAccumulator.json"
import { AssetData, AssetDataPriced, ExistingAsset } from "@/types"
import { assetConfig, AssetConfigKey } from "@/services/repo_asset_infos"
import { getTokensPrice } from "@/services/service_price"

export async function doClaim(contractAddress: Address, markets: Address[], rewardsLength: number, walletClient: WalletClient) {
  const txData = {
    abi: claimContract.abi as Abi,
    functionName: markets.length === 1 ? "claimSimple" : "claimMultiple",
    args: markets.length === 1 ? [markets[0]] : [markets, rewardsLength],
    address: contractAddress,
    gas: undefined as undefined | bigint,
  }
  return await executeContractCall(walletClient, txData)
}

export async function getTgUsdClaimOnChainData() {
  const addresses: Address[] = tgUsdMarkets.map((m) => m.marketAddress)
  // somehow did not find a way to pass the address dynamically...
  return await executeChainViewUnique<ClaimerInfo[]>(claimUI.abi as Abi, claimUI.bytecode as Hex, ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", addresses])
}

export const computeAndReturnPrices = async (claimInfo: ClaimerInfo[]) => {
  const tokens: ExistingAsset[] = []

  claimInfo.forEach((el) => {
    el.claimableTokens.forEach((t) => {
      if (!tokens.includes(t?.symbol)) tokens.push(t.symbol)
    })

    if (!tokens.includes(el.collatStaked.symbol)) tokens.push(el.collatStaked.symbol)
  })

  try {
    const list: Record<AssetConfigKey, AssetData> = assetConfig

    const prices = await getTokensPrice(tokens)

    const allInfos = Object.entries(list)
      .filter(([k]) => tokens.indexOf(k as AssetConfigKey) !== -1)
      .map(([k, v]) => {
        return {
          ...v,
          price: (prices ? prices[k as AssetConfigKey] : 0) || 0,
        }
      })
      .sort((a, b) => {
        return (a?.logo ? tokens.indexOf(a.logo) : -1) - (b?.logo ? tokens.indexOf(b.logo) : -1)
      })

    return allInfos
  } catch (error) {
    console.error("Failed to load asset information:", error)
    return []
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

    const depositedValueInUsd = Number(formatUnits(claimer.collatStakedUsdValue, Number(claimer.collatStaked.decimals)))

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

  return result
}
