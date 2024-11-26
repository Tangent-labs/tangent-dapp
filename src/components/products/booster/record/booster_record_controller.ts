import BoosterDetailABI from "@/abi/booster/BoosterDetail.json"
import { Abi, Address, Hex, zeroAddress } from "viem"
import { BoosterDetailOut, BoosterExistingAsset } from "@products/booster/booster_type"
import { executeChainViewUnique } from "@/services/service_rpc"
import { boosterStakingInfos } from "@products/booster/booster_repository"
import { AssetDataPriced, ExistingAsset } from "@/types"
import { getAssetInfo } from "@/services/service_existing_asset"
import { assert } from "@/lib/utils"
import { ADDR_TOKEN } from "@/services/repo_asset_addresses"

export const getBoosterRecordData = async (address: Address | undefined, staking: Address) => {
  address = address || zeroAddress
  const data = await executeChainViewUnique<BoosterDetailOut>(BoosterDetailABI.abi as Abi, BoosterDetailABI.bytecode as Hex, [address, staking])
  return data
}

export const getBoosterRecordServerData = async (asset: BoosterExistingAsset) => {
  const set: Set<ExistingAsset> = new Set<ExistingAsset>()
  const stakingInfo = boosterStakingInfos[asset]
  assert(!!stakingInfo, `${asset} is not referenced as a Booster staking`)
  const rewardsInfo: AssetDataPriced[] = []
  let assetsInfo: AssetDataPriced | undefined
  let sdAssetInfo: AssetDataPriced | undefined
  set.add(asset)
  const sdAsset = ADDR_TOKEN[stakingInfo.gaugeAsset] as ExistingAsset
  set.add(sdAsset)
  stakingInfo.rewards?.forEach((r) => set.add(r))
  const list = Array.from(set)
  const allInfos = await getAssetInfo([...list])
  list.forEach((_, index: number) => {
    const info = allInfos[index]
    if (info.logo === asset) {
      assetsInfo = info
    }
    if (info.logo === sdAsset) {
      sdAssetInfo = info
    }
    rewardsInfo.push(info)
  })
  return { assetsInfo, sdAssetInfo, rewardsInfo, stakingInfo }
}
