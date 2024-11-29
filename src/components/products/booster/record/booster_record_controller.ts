import BoosterDetailABI from "@/abi/booster/BoosterDetail.json"
import { Abi, Address, formatUnits, Hex, zeroAddress } from "viem"
import { BoosterDetailOut, BoosterExistingAsset, BoosterRecordPageHaderData } from "@products/booster/booster_type"
import { executeChainViewUnique } from "@/services/service_rpc"
import { boosterStakingInfos } from "@products/booster/booster_repository"
import { AssetDataPriced, ExistingAsset, TokenAmountData } from "@/types"
import { getAssetInfo } from "@/services/service_existing_asset"
import { assert } from "@/lib/utils"
import { getPricesFromTokenAmounts } from "@/lib/asset_utils"

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
  const sdAsset = stakingInfo.sdAsset as ExistingAsset
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

export const transformRecordToheaderData = (sdAssetInfo?: AssetDataPriced, data?: BoosterDetailOut, rewardsInfo?: AssetDataPriced[]) => {
  if (!data || !sdAssetInfo || !rewardsInfo) return

  const tvl = { dollarValue: "0", tokenAmount: "0" } as TokenAmountData
  const deposited = { dollarValue: "0", tokenAmount: "0" } as TokenAmountData
  const claimable = { dollarValue: "0", tokenAmount: "0" } as TokenAmountData
  const tokenAmout = Number(formatUnits(data?.boosterDetail?.totalStaked || 0n, sdAssetInfo.decimals))
  tvl.tokenAmount = `${tokenAmout.toFixed(sdAssetInfo?.displayDecimals)} ${sdAssetInfo.symbol}`
  tvl.dollarValue = `$${(tokenAmout * sdAssetInfo?.price || 0).toFixed(0)}`
  const depositedAmount = Number(formatUnits(data?.boosterDetail?.userStaked || 0n, sdAssetInfo.decimals))
  deposited.tokenAmount = `${depositedAmount.toFixed(sdAssetInfo?.displayDecimals)} ${sdAssetInfo.symbol}`
  deposited.dollarValue = `$${(depositedAmount * sdAssetInfo?.price || 0).toFixed(0)}`
  const claimableAmount = getPricesFromTokenAmounts(data?.boosterDetail?.tokensClaimable, rewardsInfo)
  claimable.dollarValue = `$${claimableAmount.data?.totalDollar.toFixed(0)}`
  return { tvl, deposited, claimable } as BoosterRecordPageHaderData
}
