import { getPricesFromTokenAmounts } from "@/lib/asset_utils"
import { formatNumber, formatDollar } from "@/lib/number_formatter"
import { AssetApr, AssetDataPriced } from "@/types"
import { BOOSTER_CONTRACT, boosterStakingInfos } from "../booster_repository"
import {
  OutputBoosterList,
  BoosterExistingAsset,
  BoosterRowExtend,
  BoosterClaimListRow,
  ClaimMultipleStakingArgs,
  ClaimSdtStakingContract,
  BoosterStakingInfo,
} from "../booster_type"
import SdtRewardDistributorABI from "@/abi/booster/SdtRewardDistributor.json"
import { Abi, Address, formatUnits, WalletClient } from "viem"
import { executeContractCall } from "@/services/service_rpc"

export const transformBoosterClaimList = (
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
  ).map((row) => _transformInListClaimRow(row, rewardsInfo))
  return result
}

export const transformBoosterClaimTotals = (rows: OutputBoosterList | undefined, rewardsInfo: AssetDataPriced[]) => {
  const totals = {
    depositedDollarValue: 0,
    claimableDollarValue: 0,
  }
  if (!rows) return totals
  ;(
    [
      [rows.balRow, boosterStakingInfos.BAL],
      [rows.crvRow, boosterStakingInfos.CRV],
      [rows.fxnRow, boosterStakingInfos.FXN],
      [rows.pendleRow, boosterStakingInfos.PENDLE],
    ] as [BoosterRowExtend | undefined, BoosterStakingInfo | undefined][]
  ).forEach(([row, stakingInfo]) => {
    if (!row) {
      return
    }

    const assetInfo = rewardsInfo.find((r) => r.symbol === stakingInfo?.asset)

    const {
      data: { totalDollar },
    } = getPricesFromTokenAmounts(row.tokensClaimable, rewardsInfo)
    totals.depositedDollarValue += Number(formatUnits(row.totalStaked, assetInfo?.decimals || 18)) * (assetInfo?.price || 0)
    totals.claimableDollarValue += totalDollar
  })
  return totals
}

export const transformCallData = (rows: BoosterClaimListRow[], stakingAddresses: Address[]): ClaimMultipleStakingArgs => {
  const rewards = new Set<string>()
  const claimContracts: ClaimSdtStakingContract[] = []
  stakingAddresses.forEach((stakingAddress) => {
    const row = rows.find((row) => row.stakingAddress === stakingAddress)
    if (row?.positionsDetails?.some((pos) => pos.tokensClaimable.some((token) => token.amount > 0n))) {
      const tokenIds = row?.positionsDetails.map((pos) => pos.tokenId)
      row?.positionsDetails?.forEach((pos) => pos.tokensClaimable.filter((token) => token.amount > 0n).forEach((token) => rewards.add(token.token)))
      claimContracts.push({
        stakingContract: stakingAddress,
        tokenIds: tokenIds || [],
      })
    }
  })

  // Calculate total SDT reward count
  // Here, we assume you can identify SDT by token address '0xSDT...' or a known symbol

  // Return the final arguments matching the claimMultipleStaking function signature
  return {
    claimContracts,
    minCvgSdtAmountOut: 0n, // customize if needed
    isConvert: false, // customize if needed
    sdtRewardCount: rewards.size,
  }
}

const _transformInListClaimRow = (row: BoosterRowExtend, rewardsInfo: AssetDataPriced[]) => {
  if (!row.tokenInfo) {
    console.error(row)
  }

  const {
    data: { totalDollar, details: claimableInfo },
  } = getPricesFromTokenAmounts(row.tokensClaimable, rewardsInfo)

  return {
    token: row.tokenInfo.logo,
    stakingAddress: row.info.stakingAddress,
    name: row.tokenInfo.logo,
    apr: {
      current: Number(formatNumber(row?.apr?.actualsApr?.totalApr || 0, 2)),
      projected: Number(formatNumber(row?.apr?.projectedApr?.totalApr || 0, 2)),
    },
    positionsDetails: row.positionsDetails,
    claimableDetail: claimableInfo,
    claimable: {
      key: "claimable",
      label: "Claimable",
      value: formatDollar(totalDollar || 0, 0),
      raw: totalDollar || 0,
    },
    callData: {},
  } as BoosterClaimListRow
}

export async function doClaimAll(args: ClaimMultipleStakingArgs, walletClient: WalletClient) {
  const txData = {
    abi: SdtRewardDistributorABI.abi as Abi,
    functionName: "claimMultipleStaking",
    address: BOOSTER_CONTRACT.REWARD_DISTRIBUTOR,
    args: [args.claimContracts, args.minCvgSdtAmountOut, args.isConvert, args.sdtRewardCount],
    gas: undefined as undefined | bigint,
  }
  return await executeContractCall(walletClient, txData)
}
