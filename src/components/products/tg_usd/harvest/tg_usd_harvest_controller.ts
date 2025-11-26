import { formatDate } from "@/lib/other_formatter"
import { Abi, Address, Hex, WalletClient } from "viem"
import harvestUI from "../../../../abi/USG/HarvestUI.json"
import { getTokensPrice } from "@/services/service_price"
import { getPricesFromTokenAmounts } from "@/lib/asset_utils"
import { USG_CONTRACT, USGMarkets } from "../tg_usd_repository"
import { HarvesterInfo, HarvesterInfoDisplay } from "../tg_usd_type"
import { assetConfig, AssetConfigKey } from "@/services/repo_asset_infos"
import rewardAccumulator from "../../../../abi/USG/RewardAccumulator.json"
import { AssetData, AssetDataPriced, ExistingAsset, ListHeaderData } from "@/types"
import { executeChainViewUnique, executeContractCall } from "@/services/service_rpc"

export async function doHarvest(stakingAddress: Address, walletClient: WalletClient) {
  const [account] = await walletClient.requestAddresses()

  const txData = {
    abi: rewardAccumulator.abi as Abi,
    functionName: "processRewards",
    args: [stakingAddress, account],
    address: USG_CONTRACT.REWARD_ACCUMULATOR,
    gas: undefined as undefined | bigint,
  }
  return await executeContractCall(walletClient, txData)
}

export async function doMultiHarvest(addresses: Array<Address>, walletClient: WalletClient) {
  const [account] = await walletClient.requestAddresses()

  const txData = {
    abi: rewardAccumulator.abi as Abi,
    functionName: "processMultiRewards",
    args: [addresses, account, addresses.length],
    address: USG_CONTRACT.REWARD_ACCUMULATOR,
    gas: undefined as undefined | bigint,
  }
  return await executeContractCall(walletClient, txData)
}

export async function getTgUsdHarvestOnChainData() {
  const addresses: Address[] = USGMarkets.map((m) => m.marketAddress)

  return await executeChainViewUnique<HarvesterInfo[]>(harvestUI.abi as Abi, harvestUI.bytecode as Hex, [addresses, USG_CONTRACT.REWARD_ACCUMULATOR])
}

export function transformHarvestOnChainData(harvesterInfos: HarvesterInfo[], assetInfos: AssetDataPriced[]) {
  const processOne = (info: HarvesterInfo) => {
    const stakingInfo = Object.values(USGMarkets).find((i) => i.marketAddress === info.marketAddress)
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
      lastHarvestDate: formatDate(new Date(Number(info.lastHarvestDate) * 1000), "dd-MM-yyyy"),
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

export const harvestListHeaders: ListHeaderData[] = [
  { label: "Assets", key: "assets" },
  { label: "Total Rewards", key: "totalRewards", sort: "sort" },
  { label: "Harvester Fees", key: "harvesterFees", sort: "sort" },
  { label: "Harvester Rewards", key: "harvesterRewards", sort: "sort" },
  { label: "", key: "" },
]
