import { ClaimData, ClaimerInfo, MarketAPRs } from "../usg_type"
import claimUI from "../../../../abi/USG/ClaimUI.json"
import { getTokensPrice } from "@/services/service_price"
import { USG_CONTRACT, USGMarkets } from "../usg_repository"
import { Abi, Address, formatUnits, Hex, WalletClient } from "viem"
import claimContract from "../../../../abi/USG/RewardAccumulator.json"
import { AssetDataPriced, ListHeaderData } from "@/types"
import { executeChainViewUnique, executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { getRewardTokenFromAprDetails } from "../list/usg_market_controller"
import { ERC20S } from "@/data/erc20s"

export async function doSimpleClaim(market: Address, walletClient: WalletClient) {
  const txData = {
    abi: claimContract.abi as Abi,
    functionName: "claimSimple",
    args: [market],
    address: USG_CONTRACT.REWARD_ACCUMULATOR,
    gas: undefined as undefined | bigint,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export async function doMultiClaim(markets: Address[], rewardsLength: number, walletClient: WalletClient) {
  const txData = {
    abi: claimContract.abi as Abi,
    functionName: "claimMultiple",
    args: [markets, rewardsLength],
    address: USG_CONTRACT.REWARD_ACCUMULATOR,
    gas: undefined as undefined | bigint,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}
export async function getUSGClaimOnChainData(currentAddress: string) {
  const addresses: Address[] = USGMarkets.map((m) => m.marketAddress)
  return await executeChainViewUnique<ClaimerInfo[]>(claimUI.abi as Abi, claimUI.bytecode as Hex, [currentAddress, addresses, USG_CONTRACT.MARKET_VIEWER])
}

export async function getRewardTokensInfos(claimerInfos: ClaimerInfo[]) {
  const tokens: Address[] = []

  // Iterate over markets
  claimerInfos.forEach((c) => {
    // Iterate over tokens
    c.claimableTokens.forEach((ct) => {
      if (!tokens.includes(ct.token)) tokens.push(ct.token.toString().toLowerCase() as Address)
    })
  })
  try {
    const prices = (await getTokensPrice(tokens))!
    const tokenDetails = ERC20S.filter((t) => tokens.includes(t.address)).map((t) => {
      return {
        ...t,
        price: prices[t.address],
      }
    })

    return tokenDetails as AssetDataPriced[]
  } catch (error) {
    console.error("Failed to load asset information:", error)
    return
  }
}

export function transformClaimOnChainData(claimerInfos: ClaimerInfo[], assetInfos: AssetDataPriced[], marketAprs: MarketAPRs[]) {
  const getPriceBySymbol = (symbol: string): number => {
    const asset = assetInfos.find((info) => info.symbol === symbol)
    return asset ? asset.price : 0
  }

  const result = claimerInfos.map((claimer) => {
    // Hide lines with 0 wei of token to claim
    const claimable = claimer.claimableTokens
      .filter((c) => c.amount !== 0n)
      .map((token) => {
        const tokenPrice = getPriceBySymbol(token.symbol)

        const valueInUsd = Number(formatUnits(token.amount, Number(token.decimals))) * tokenPrice

        return {
          symbol: token.symbol,
          amount: token.amount.toString(),
          valueInUsd: valueInUsd.toFixed(2),
        }
      })

    const totalClaimableValue = claimable.reduce((sum, token) => sum + parseFloat(token.valueInUsd), 0)

    const depositedValueInUsd = parseFloat(formatUnits(claimer.collatStakedUsdValue, 18))

    const deposited = {
      symbol: claimer.collatStaked.symbol,
      amount: claimer.collatStaked.amount.toString(),
      valueInUsd: depositedValueInUsd.toFixed(2),
    }

    const marketConfig = USGMarkets.find((m) => m.marketAddress === claimer.marketAddress)!

    // APR Computing Section
    let totalCurrentAPR = 0
    let totalProjectedAPR = 0
    let rewardToken = "CRV"

    const marketDataApr = marketAprs?.find((el) => el?.marketAddress?.toLowerCase() === marketConfig?.marketAddress?.toLowerCase())

    if (marketDataApr && marketDataApr?.currentAPR && marketDataApr?.projectedAPR) {
      totalCurrentAPR = Object.values(marketDataApr?.currentAPR).reduce((sum, value) => Number(sum) + Number(value), 0) as number
      totalProjectedAPR = Object.values(marketDataApr?.projectedAPR).reduce((sum, value) => Number(sum) + Number(value), 0) as number

      rewardToken = getRewardTokenFromAprDetails(marketDataApr?.currentAPR, marketConfig?.marketType || "Curve")
    }

    return {
      marketType: marketConfig.marketType,
      marketAddress: claimer.marketAddress,
      marketName: marketConfig.marketName,
      logoKey: marketConfig.logoKey,
      claimable,
      totalClaimableValue: totalClaimableValue.toFixed(2),
      deposited,
      totalDepositedValue: deposited.valueInUsd,
      totalCurrentAPR,
      totalProjectedAPR,
      rewardToken,
      apr: {
        current: Number(totalCurrentAPR),
        projected: marketConfig?.marketType === "Pendle_PT" ? undefined : Number(totalProjectedAPR),
      },
      currentAPRDetails: marketDataApr?.currentAPR,
      projectedAPRDetails: marketDataApr?.projectedAPR,
    }
  })

  result.sort((marketA, marketB) => parseFloat(marketB.totalClaimableValue) - parseFloat(marketA.totalClaimableValue))

  return result
}

export const claimListHeaders: ListHeaderData[] = [
  { label: "Market", key: "marketName", sort: "sort" },
  { label: "APR", key: "apr", sort: "sort" },
  { label: "Claimable", key: "totalClaimableValue", sort: "sort" },
  { label: "Deposited", key: "totalDepositedValue", sort: "sort" },
  { label: "", key: "" },
]

export const sortClaimListByType = (elementA: ClaimData, elementB: ClaimData, direction: string) => {
  let computedAPRA = 0
  let computedAPRB = 0

  if (elementA?.marketType === "Pendle_PT") {
    computedAPRA = Number(elementA?.apr?.current)
  } else {
    computedAPRA = Number(elementA?.currentAPRDetails?.[elementA?.rewardToken]) === 0 ? Number(elementA?.apr?.projected) : Number(elementA?.apr?.current)
  }

  if (elementB?.marketType === "Pendle_PT") {
    computedAPRB = Number(elementB?.apr?.current)
  } else {
    computedAPRB = Number(elementB?.currentAPRDetails?.[elementB?.rewardToken]) === 0 ? Number(elementB?.apr?.projected) : Number(elementB?.apr?.current)
  }

  if (computedAPRA < computedAPRB) return direction === "asc" ? -1 : 1
  if (computedAPRA > computedAPRB) return direction === "asc" ? 1 : -1

  return 0
}
