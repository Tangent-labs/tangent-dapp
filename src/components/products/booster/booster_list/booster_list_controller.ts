import BoosterListABI from "@/abi/booster/BoosterList.json"

import { executeChainViewUnique } from "@/services/service_rpc"
import { Abi, Address, formatUnits, Hex, zeroAddress } from "viem"
import { BoosterExistingAsset, BoosterRowExtend, OutputBoosterList } from "../booster_type"
import { AssetApr, AssetDataPriced, ExistingAsset, ListHeaderData, ListRowData } from "@/types"
import { boosterStakingInfos } from "../booster_repository"
import { formatDollar, formatNumber } from "@/lib/number_formatter"
import { getAssetInfo } from "@/services/service_existing_asset"
import { getPricesFromTokenAmounts } from "@/lib/asset_utils"

export const getBoosterListServerData = async () => {
  const rewardsInfo: AssetDataPriced[] = []
  const assetList: ExistingAsset[] = []
  const assetsInfos: Partial<{ [K in BoosterExistingAsset]: AssetDataPriced }> = {}
  const assetSet = new Set<ExistingAsset>()

  Object.entries(boosterStakingInfos).forEach(([key, value]) => {
    assetSet.add(key as ExistingAsset)
    assetList.push(key as ExistingAsset)
    value.rewards?.forEach((r) => assetSet.add(r))
  })
  const list = [...assetSet]
  const allInfos = await getAssetInfo(list)

  list.forEach((inf, index: number) => {
    const info = allInfos[index]
    if (info.logo && assetList.includes(inf)) {
      assetsInfos[inf as BoosterExistingAsset] = info
    }
    rewardsInfo.push(info)
  })
  return { assetsInfos: assetsInfos as { [K in BoosterExistingAsset]: AssetDataPriced }, rewardsInfo }
}

export const getBoosterListData = async (address: Address | undefined) => {
  address = address || zeroAddress
  return await executeChainViewUnique<OutputBoosterList>(BoosterListABI.abi as Abi, BoosterListABI.bytecode as Hex, [address])
}

export const transformBoosterList = (
  rows: OutputBoosterList | undefined,
  aprs: Record<BoosterExistingAsset, AssetApr> | undefined,
  assetInfos: Record<BoosterExistingAsset, AssetDataPriced>,
  rewardsInfo: AssetDataPriced[]
) => {
  const result = (
    [
      { tokenInfo: assetInfos.BAL, info: boosterStakingInfos.BAL, ...(rows?.balRow || {}), apr: aprs?.BAL },
      { tokenInfo: assetInfos.CRV, info: boosterStakingInfos.CRV, ...(rows?.crvRow || {}), apr: aprs?.CRV },
      { tokenInfo: assetInfos.FXN, info: boosterStakingInfos.FXN, ...(rows?.fxnRow || {}), apr: aprs?.FXN },
      { tokenInfo: assetInfos.PENDLE, info: boosterStakingInfos.PENDLE, ...(rows?.pendleRow || {}), apr: aprs?.PENDLE },
    ] as BoosterRowExtend[]
  ).map((row) => _transformInListRow(row, rewardsInfo)) as ListRowData[]
  return result
}

const _transformInListRow = (row: BoosterRowExtend, rewardsInfo: AssetDataPriced[]) => {
  if (!row.tokenInfo) {
    console.error(row)
  }
  const tvl = Number(formatUnits(row?.totalStaked || 0n, row.tokenInfo.decimals))
  const tvlDollar = tvl * row?.tokenInfo?.price || 0
  const claimableInfo = getPricesFromTokenAmounts(row.tokensClaimable, rewardsInfo)
  const depositedInfo = getPricesFromTokenAmounts([{ token: row.info.sdAsset, amount: row.userStaked }], rewardsInfo)
  return {
    token: row.tokenInfo.logo,
    name: row.tokenInfo.logo,
    apr: {
      current: Number(formatNumber(row?.apr?.actualsApr?.totalApr || 0, 2)),
      projected: Number(formatNumber(row?.apr?.projectedApr?.totalApr || 0, 2)),
    },
    indicators: [
      { key: "boost", label: "Boost", value: "" /*row?.apr?.boostsData*/, raw: 0 },
      { key: "tvl", label: ` ${formatNumber(tvl, row.tokenInfo.displayDecimals)} ${row.tokenInfo.logo}`, value: formatDollar(tvlDollar, 0), raw: tvl },
      { key: "deposited", label: "Deposited", value: formatDollar(depositedInfo?.data?.totalDollar || 0, 0), raw: depositedInfo?.data?.totalDollar || 0 },
      { key: "claimable", label: "Claimable", value: formatDollar(claimableInfo?.data?.totalDollar || 0, 0), raw: claimableInfo?.data?.totalDollar || 0 },
    ],
  } as ListRowData
}

export const boosterListHeaders: ListHeaderData[] = [
  { label: "Strategy", key: "strategy" },
  { label: "APR", key: "apr" },
  { label: "Boost", key: "boost" },
  { label: "TVL", key: "tvl" },
  { label: "Deposited", key: "deposited" },
  { label: "Claimable", key: "claimable" },
]
