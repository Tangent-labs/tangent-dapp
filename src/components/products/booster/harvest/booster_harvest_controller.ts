import { Abi, Address, Hex, WalletClient } from "viem"
import { executeChainViewUnique, executeContractCall } from "@/services/service_rpc"
import SdtStakingProcessableRewardsABI from "@/abi/booster/SdtStakingProcessableRewards.json"
import SdtStakingPositionServiceABI from "@/abi/booster/SdtStakingPositionService.json"
import { boosterStakingInfos } from "../booster_repository"
import { HarvesterInfo, HarvesterInfoDisplay } from "../booster_type"
import { AssetDataPriced } from "@/types"
import { TOKEN_ADDR } from "@/services/repo_asset_addresses"
import { getPricesFromTokenAmounts } from "@/lib/asset_utils"

export async function doHarvest(stakingAddress: Address, walletClient: WalletClient) {
  const txData = {
    abi: SdtStakingPositionServiceABI.abi as Abi,
    functionName: "processSdtRewards",
    args: [],
    address: stakingAddress,
    gas: undefined as undefined | bigint,
  }
  return await executeContractCall(walletClient, txData)
}

export async function getBoosterHarvestOnChainData() {
  const addresses: Address[] = Object.values(boosterStakingInfos).map((i) => i.stakingAddress)
  return await executeChainViewUnique<HarvesterInfo[]>(SdtStakingProcessableRewardsABI.abi as Abi, SdtStakingProcessableRewardsABI.bytecode as Hex, [addresses])
}

export function transformHarvestOnChainData(harvesterInfos: HarvesterInfo[], assetInfos: AssetDataPriced[]) {
  const processOne = (info: HarvesterInfo) => {
    const stakingInfo = Object.values(boosterStakingInfos).find((i) => i.stakingAddress === info.stakingContract)
    if (!stakingInfo) return
    const assetInfo = assetInfos.find((a) => a.address === TOKEN_ADDR[stakingInfo.asset])
    if (!assetInfo) return
    const rewards = getPricesFromTokenAmounts(info.tokenAmounts, assetInfos)
    const percentage = Number(info.harvesterPercentage) / 1000
    return {
      asset: stakingInfo.asset,
      percentage,
      harvesterFees: (rewards.data.totalDollar * percentage) / 100,
      rewards: rewards?.data,
      isProcessed: info.isSdtProcessed,
      stakingAddress: stakingInfo.stakingAddress,
    } as HarvesterInfoDisplay
  }
  return harvesterInfos?.map(processOne).filter((a) => !!a) || []
}
