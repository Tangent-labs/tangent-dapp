import { executeChainViewUnique, executeContractCall } from "@/services/service_rpc"
import { Abi, Address, Hex, WalletClient } from "viem"
import harvestUI from "@/abi/tgusd/HarvestUI.json"
import { HarvesterInfo } from "../tg_usd_type"
import { AssetDataPriced } from "@/types"
import { tgUsdMarkets } from "../tg_usd_repository"
import { getPricesFromTokenAmounts } from "@/lib/asset_utils"
import { HarvesterInfoDisplay } from "../../booster/booster_type"

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

    // const assetInfo = assetInfos.find((a) => a.address === TOKEN_ADDR[stakingInfo.asset])
    // if (!assetInfo) return

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
