"use client"

import { ERC20S } from "@/data/erc20s"
import { getPricesFromTokenAmounts } from "@/lib/asset_utils"
import { formatDate } from "@/lib/other_formatter"
import { getTokensPrice } from "@/services/service_price"
import { executeChainViewUnique, executeContractCall, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { AssetDataPriced, ListHeaderData } from "@/types"
import { COMMON_ERC20S } from "@tangent/defi-resources"
import { Abi, Address, encodeFunctionData, Hex, WalletClient } from "viem"
import campaignRewardDistrib from "../../../../abi/USG/CampaignRewardsDistributorStakeDao.json"
import harvestUI from "../../../../abi/USG/HarvestUI.json"
import rewardAccumulator from "../../../../abi/USG/RewardAccumulator.json"

import { USG_CONTRACT, USGMarkets } from "../usg_repository"
import { HarvesterInfo, HarvesterInfoDisplay, USGTokenAmount } from "../usg_type"

export type ExtraRewards = {
  token: string
  claimable: bigint
  proof: string[]
}

const CAMPAIGN_REWARD_DISTRIBUTOR = "0xd4898a378ea555595c4e7dbde722b134a3f346d1" as Address

export async function doHarvest(stakingAddress: string, walletClient: WalletClient, extraRewards: ExtraRewards[]) {
  const [account] = await walletClient.requestAddresses()

  // Claim StakeDao extra rewards first. Claims that would revert (already claimed, or the
  // StakeDao API serving a proof for a root not yet live on-chain) are skipped so they never block the harvest.
  const claims: Hex[] = []
  for (const r of extraRewards) {
    const call = {
      abi: campaignRewardDistrib as Abi,
      functionName: "claim",
      args: [stakingAddress, r.token, r.claimable, r.proof],
    }
    try {
      await getPublicClient().simulateContract({ ...call, address: CAMPAIGN_REWARD_DISTRIBUTOR, account })
      claims.push(encodeFunctionData(call))
    } catch (e) {
      console.error(`Skipping extra reward claim for ${r.token}`, e)
    }
  }
  if (claims.length) {
    const txExtraHash = await executeContractCall(walletClient, {
      abi: campaignRewardDistrib as Abi,
      functionName: "multicall",
      args: [claims],
      address: CAMPAIGN_REWARD_DISTRIBUTOR,
    })
    await waitForTransaction(txExtraHash)
  }

  const txData = {
    abi: rewardAccumulator.abi as Abi,
    functionName: "processRewards",
    args: [stakingAddress, account],
    address: USG_CONTRACT.REWARD_ACCUMULATOR,
    gas: undefined as undefined | bigint,
  }
  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export async function doMultiHarvest(marketAddresses: Address[], rewardAmount: number, walletClient: WalletClient) {
  const [account] = await walletClient.requestAddresses()

  const txData = {
    abi: rewardAccumulator.abi as Abi,
    functionName: "processMultiRewards",
    args: [marketAddresses, account, rewardAmount],
    address: USG_CONTRACT.REWARD_ACCUMULATOR,
    gas: undefined as undefined | bigint,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}
const chainviewParamIn = USGMarkets.map((m) => {
  let typeId = 12 // Bcs 12 is fun

  switch (m.marketType) {
    case "Convex_CRV":
      typeId = 0
      break
    case "Convex_FXN":
      typeId = 1
      break
    case "STAKEDAO_CRV_Vault":
      typeId = 2
      break
    case "CRV_Gauge":
      typeId = 3
      break
  }
  return {
    marketAddress: m.marketAddress,
    marketType: typeId,
  }
})
export async function getUSGHarvestOnChainData() {
  const chainviewData = (await executeChainViewUnique<HarvesterInfo[]>(harvestUI.abi as Abi, harvestUI.bytecode as Hex, [
    chainviewParamIn,
    USG_CONTRACT.REWARD_ACCUMULATOR,
  ]))!
  return chainviewData.map((m, i) => ({ ...m, marketType: chainviewParamIn[i].marketType }))
}
export type StakeDaoAlreadyClaimed = {
  marketAddress: Address
  tokens: USGTokenAmount[]
}
export function transformHarvestOnChainData(harvestInfos: (HarvesterInfo & { marketType: number })[], assetInfos: AssetDataPriced[], stakeDaoMerkle: Merk[]) {
  const processOne = (marketInfo: HarvesterInfo) => {
    const stakingInfo = USGMarkets.find((i) => i.marketAddress === marketInfo.marketAddress)
    if (!stakingInfo) return
    const isStakeDao = stakingInfo.marketType === "STAKEDAO_CRV_Vault"
    let tokenAmounts: USGTokenAmount[] = []
    const crvAddress = COMMON_ERC20S.CRV.toLowerCase()

    // For stake DAO, harvestable rewards are :
    //      - Rewards held by the contracts
    //      - CRV claimable into the accountant
    //      - Extra rewards (SDT, BOLD...) still to claim on the StakeDao Merkle contract
    // Rewards in .claimableRewards are rewards already claimable by the market on the StakeDao Merkle contract.
    if (isStakeDao) {
      const marketAddress = marketInfo.marketAddress.toLowerCase()
      const pending = stakeDaoMerkle.find((m) => m.marketAddress.toLowerCase() === marketAddress)?.pending ?? []
      // ponytail: extras only counted for tokens the HarvestUI view already lists in balancesRewards
      tokenAmounts = marketInfo.balancesRewards.map((bR) => {
        let claimable = 0n
        if (bR.symbol === "CRV") {
          claimable =
            marketInfo.claimableRewards.find((cR) => {
              return cR.token.toLowerCase() === crvAddress
            })?.amount || 0n
        }
        const extra = pending.find((p) => p.token.toLowerCase() === bR.token.toLowerCase())?.amount || 0n
        return { ...bR, amount: bR.amount + claimable + extra }
      })
    }
    // For any other contracts, we are summing rewards held by the market
    // and rewards claimable by the market on the underlying protocol
    else {
      tokenAmounts = marketInfo.balancesRewards.map((bR) => {
        const claimable = marketInfo.claimableRewards.find((cR) => cR.token === bR.token)?.amount || 0n
        return { ...bR, amount: bR.amount + claimable }
      })
    }

    const rewards = getPricesFromTokenAmounts(tokenAmounts, assetInfos)
    const percentage = Number(marketInfo.harvesterFeePercentage) / 1000
    return {
      asset: stakingInfo?.marketName,
      logoKey: stakingInfo.logoKey,
      percentage,
      harvesterFees: (rewards.data.totalDollar * percentage) / 100,
      rewards: rewards?.data,
      isProcessed: true,
      contractAddress: stakingInfo.marketAddress,
      lastHarvestDate: formatDate(new Date(Number(marketInfo.lastHarvestDate) * 1000), "dd-MM-yyyy"),
    } as HarvesterInfoDisplay
  }

  return harvestInfos?.map(processOne).filter((a) => !!a) || []
}

export const getRewardTokensInfos = async (harvestInfo: HarvesterInfo[]) => {
  const tokens: Address[] = []

  // Iterate over markets
  harvestInfo.forEach((m) => {
    // Iterate over tokens
    m.balancesRewards.forEach((br) => {
      if (!tokens.includes(br.token)) tokens.push(br.token.toString().toLowerCase() as Address)
    })
  })
  try {
    const prices = (await getTokensPrice(tokens))!
    const tokenDetails = ERC20S.filter((t) => {
      return tokens.includes(t.address)
    }).map((t) => {
      return {
        ...t,
        price: prices[t.address],
        displayDecimals: t.displayDecimals ?? 2,
      }
    })

    return tokenDetails satisfies AssetDataPriced[]
  } catch (error) {
    console.error("Failed to load asset information:", error)
    return
  }
}

export async function getStakeDaoMerkleData(stakeDaoInfos: HarvesterInfo[]): Promise<Merk[]> {
  const results = await Promise.all(
    stakeDaoInfos.map(async (sdi) => {
      try {
        const res = await fetch(`/api/stakedao/merkles?user=${sdi.marketAddress}`)
        const merkleData = (await res.json()) as TokenReward[]
        // Merkle amounts are cumulative: what is still to claim is amount - already claimed on-chain
        const pending = await Promise.all(
          merkleData.map(async (t) => {
            const claimed = (await getPublicClient().readContract({
              abi: campaignRewardDistrib as Abi,
              address: CAMPAIGN_REWARD_DISTRIBUTOR,
              functionName: "claimed",
              args: [sdi.marketAddress, t.merkle.token],
            })) as bigint
            const amount = BigInt(t.merkle.amount) - claimed
            return { token: t.merkle.token, amount: amount > 0n ? amount : 0n }
          })
        )
        return { marketAddress: sdi.marketAddress, merkleData, pending }
      } catch (e) {
        console.error(`Failed to load StakeDao merkle for ${sdi.marketAddress}`, e)
      }
    })
  )
  return results.filter((r) => !!r)
}

interface TokenExtensions {
  onChainPrice?: {
    to: Address
    data: string
    decimals: number
  }
  coingeckoId?: string
}

interface TokenObj {
  id: string
  name: string
  address: Address
  symbol: string
  decimals: number
  chainId: number
  logoURI: string
  tags: string[]
  extensions: TokenExtensions
}

interface Merkle {
  account: Address
  proof: string[]
  amount: string
  rewardAmount: string
  rewardAmountInUsd: number
  isUniversal: boolean
  token: Address
}

export interface TokenReward {
  address: Address
  tokenObj: TokenObj
  merkleContract: Address
  chainId: number
  merkle: Merkle
  tokenPriceInUsd: number
  tokenDecimals: number
  isUniversal: boolean
}

export interface Merk {
  marketAddress: Address
  merkleData: TokenReward[]
  pending: { token: Address; amount: bigint }[]
}

export const harvestListHeaders: ListHeaderData[] = [
  { label: "Market", key: "asset", sort: "sort" },
  { label: "Total Rewards", key: "totalRewards", sort: "sort" },
  { label: "Harvester Fees", key: "percentage", sort: "sort" },
  { label: "Harvester Rewards", key: "harvesterRewards", sort: "sort" },
  { label: "Last Harvest", key: "lastHarvestDate", sort: "sort" },
]
