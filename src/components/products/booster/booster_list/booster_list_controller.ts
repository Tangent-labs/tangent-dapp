import BoosterListABI from "@/abi/booster/BoosterList.json"
import { executeChainViewUnique } from "@/services/service_rpc"
import { Abi, formatUnits, Hex, zeroAddress } from "viem"
import { BoosterExistingAsset, BoosterRowExtend, OutputBoosterList } from "../booster_type"
import { AssetApr, AssetDataPriced, ListHeaderData, ListRowData } from "@/types"
import { boosterStakingInfos } from "../booster_repository"
import { formatDollar, formatNumber } from "@/lib/number_formatter"

export const getBoosterListData = async () => {
  const data = await executeChainViewUnique<OutputBoosterList>(BoosterListABI.abi as Abi, BoosterListABI.bytecode as Hex, [zeroAddress])
  return data
}

export const transformBoosterList = (
  rows: OutputBoosterList | undefined,
  aprs: Record<BoosterExistingAsset, AssetApr> | undefined,
  [balInfo, crvInfo, fxnInfo, pendleInfo]: [AssetDataPriced, AssetDataPriced, AssetDataPriced, AssetDataPriced]
) => {
  const result = (
    [
      { tokenInfo: balInfo, info: boosterStakingInfos.BAL, ...(rows?.balRow || {}), apr: aprs?.BAL },
      { tokenInfo: crvInfo, info: boosterStakingInfos.CRV, ...(rows?.crvRow || {}), apr: aprs?.CRV },
      { tokenInfo: fxnInfo, info: boosterStakingInfos.FXN, ...(rows?.fxnRow || {}), apr: aprs?.FXN },
      { tokenInfo: pendleInfo, info: boosterStakingInfos.PENDLE, ...(rows?.pendleRow || {}), apr: aprs?.PENDLE },
    ] as BoosterRowExtend[]
  ).map((row) => _transformInListRow(row)) as ListRowData[]
  return result
}

const _transformInListRow = (row: BoosterRowExtend) => {
  const tvl = Number(formatUnits(row?.totalStaked || 0n, row.tokenInfo.decimals))
  const tvlDollar = tvl * row?.tokenInfo?.price || 0
  const deposited = Number(formatUnits(row?.userStaked || 0n, row.tokenInfo.decimals)) * row?.tokenInfo?.price || 0
  //const claimable = Number(formatUnits(row?.tokensClaimable||0n,row.tokenInfo.decimals)) * row?.tokenInfo?.price || 0
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
      { key: "deposited", label: "Deposited", value: formatDollar(deposited, 0), raw: deposited },
      { key: "claimable", label: "Claimable", value: formatDollar(0, 0), raw: 0 },
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
