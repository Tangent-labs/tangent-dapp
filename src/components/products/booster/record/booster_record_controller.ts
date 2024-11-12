import BoosterDetailABI from "@/abi/booster/BoosterDetail.json"
import { Abi, Address, Hex, zeroAddress } from "viem"
import { BoosterDetailOut, BoosterExistingAsset } from "@products/booster/booster_type"
import { executeChainViewUnique } from "@/services/service_rpc"
import { boosterStakingInfos } from "@products/booster/booster_repository"
import { AssetDataPriced, ExistingAsset } from "@/types"
import { getAssetInfo } from "@/services/service_existing_asset"
import { assert } from "@/lib/utils"

export const getBoosterRecordData = async (address: Address | undefined, staking: Address) => {
  address = address || zeroAddress
  const data = await executeChainViewUnique<BoosterDetailOut>(BoosterDetailABI.abi as Abi, BoosterDetailABI.bytecode as Hex, [address, staking])
  return data
}

/* 
 async doStakeGauge(tokenId, stakingAddress, amount, signer) {
        const contract = new ethers.Contract(stakingAddress, sdtStakingPositionServiceAbi.abi, signer);
        return await contract.deposit(tokenId, amount, ethers.ZeroAddress);
    }
 async doStakeWithSdtUtilities(type, tokenType, tokenId, stakingAddress, amount, amountMin, signer) {
        const ZERO = 0n;
        const gaugeAssetAmount = tokenType === "gauge" ? amount : ZERO;
        let assetAmount = tokenType === "asset" ? amount : ZERO;
        const ecosystemData = await ecosystemService.getStaticData();
        const contract = new ethers.Contract(ecosystemData?.stakedao.sdtUtilities, sdtUtilitiesAbi.abi, signer);
        if (type === "sd") {
            let sdAssetAmount = tokenType === "sd" ? amount : ZERO;
            const isLock = false;
            return await contract.convertAndStakeSdAsset(tokenId, stakingAddress, gaugeAssetAmount, amountMin, sdAssetAmount, assetAmount, isLock);
        }
        if (type === "lp") {
            let lpAssetAmount = tokenType === "lp" ? amount : ZERO;
            const isEarn = true;
            return await contract.convertAndStakeLpAsset(tokenId, stakingAddress, gaugeAssetAmount, lpAssetAmount, isEarn);
        }
    }
        */

export const getBoosterRecordServerData = async (asset: BoosterExistingAsset) => {
  const set: Set<ExistingAsset> = new Set<ExistingAsset>()
  const stakingInfo = boosterStakingInfos[asset]
  assert(!!stakingInfo, `${asset} is not referenced as a Booster staking`)
  const rewardsInfo: AssetDataPriced[] = []
  let assetsInfo: AssetDataPriced | undefined
  set.add(asset)
  stakingInfo.rewards?.forEach((r) => set.add(r))
  const list = Array.from(set)
  const allInfos = await getAssetInfo([...list])
  list.forEach((_, index: number) => {
    const info = allInfos[index]
    if (info.logo === asset) {
      assetsInfo = info
    }
    rewardsInfo.push(info)
  })

  return { assetsInfo, rewardsInfo, stakingInfo }
}
