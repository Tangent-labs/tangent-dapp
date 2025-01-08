import { executeChainViewUnique, executeContractCall } from "@/services/service_rpc"
import { Abi, Address, Hex, WalletClient } from "viem"
import harvestUI from "@/abi/tgusd/HarvestUI.json"
import { HarvesterInfo } from "../tg_usd_type"
import { AssetData, AssetDataPriced, ExistingAsset } from "@/types"
import { tgUsdMarkets } from "../tg_usd_repository"
import { getPricesFromTokenAmounts } from "@/lib/asset_utils"
import { HarvesterInfoDisplay } from "../../booster/booster_type"
import { assetConfig, AssetConfigKey } from "@/services/repo_asset_infos"
import { getTokensPrice } from "@/services/service_price"

export async function doHarvest(stakingAddress: Address, walletClient: WalletClient) {
  const txData = {
    abi: harvestUI.abi as Abi,
    functionName: "processRewards",
    args: [],
    address: stakingAddress,
    gas: undefined as undefined | bigint,
  }
  return await executeContractCall(walletClient, txData)
}

export async function getTgUsdHarvestOnChainData() {
  const addresses: Address[] = tgUsdMarkets.map((m) => m.marketAddress)
  return await executeChainViewUnique<HarvesterInfo[]>(harvestUI.abi as Abi, harvestUI.bytecode as Hex, [addresses])
}

export function transformHarvestOnChainData(harvesterInfos: HarvesterInfo[], assetInfos: AssetDataPriced[]) {
  const processOne = (info: HarvesterInfo) => {
    const stakingInfo = Object.values(tgUsdMarkets).find((i) => i.marketAddress === info.marketAddress)
    if (!stakingInfo) return

    const rewards = getPricesFromTokenAmounts(info.tokenAmounts, assetInfos)
    const percentage = Number(info.harvesterFeePercentage) / 1000
    return {
      asset: stakingInfo.marketName,
      percentage,
      harvesterFees: (rewards.data.totalDollar * percentage) / 100,
      rewards: rewards?.data,
      isProcessed: true,
      contractAddress: stakingInfo.marketAddress,
    } as HarvesterInfoDisplay
  }
  return harvesterInfos?.map(processOne).filter((a) => !!a) || []
}

export const computeAndReturnPrices = async (harvestInfo: HarvesterInfo[]) => {
  const tokens: ExistingAsset[] = []

  harvestInfo.forEach((el) => {
    el.tokenAmounts.forEach((t) => {
      if (!tokens.includes(t?.symbol)) tokens.push(t.symbol)
    })
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
    return
  }
}
