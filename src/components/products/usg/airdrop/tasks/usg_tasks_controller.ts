import { ListHeaderData } from "@/types"
import { Abi, Address, Hex } from "viem"
import { executeChainViewUnique, getPublicClient } from "@/services/service_rpc"
import TaskListUI from "../../../../../abi/USG/TaskListUI.json"
import { USG_CONTRACT, USG_MORPHO } from "../../usg_repository"
import { LpTask } from "../../usg_type"

export const mapAirdropData = (tasks: LpTask[]) => {
  if (!tasks || tasks.length === 0) return []

  return [...tasks].sort((a: LpTask, b: LpTask) => {
    if (a.status && !b.status) return -1
    if (!a.status && b.status) return 1

    if (a.status && !b.status) {
      return b.pointRate - a.pointRate
    }
    return 0
  })
}

export const lpListHeaders: ListHeaderData[] = [
  { label: "Action", key: "action" },
  { label: "Protocol", key: "protocol" },
  { label: "Pts/Day/USD", key: "pointRate" },
  { label: "Owned", key: "balanceUsd" },
  { label: "Points", key: "points" },
  { label: "Status", key: "status" },
]

export const voteListHeaders: ListHeaderData[] = [
  { label: "Action", key: "action" },
  { label: "Protocol", key: "protocol" },
  { label: "Pts/Epoch/Tkn", key: "pointRate" },
  { label: "Points", key: "points" },
  { label: "Current vote", key: "lastVote" },
]

export async function getUserBalancesAndDebtForLpTasks(address: Address, markets: Address[], tokens: Address[]) {
  return await executeChainViewUnique<bigint[]>(TaskListUI.abi as Abi, TaskListUI.bytecode as Hex, [address, markets, tokens, USG_CONTRACT.MARKET_VIEWER])
}

const morphoPositionAbi = [
  {
    inputs: [
      { internalType: "Id", name: "id", type: "bytes32" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "position",
    outputs: [
      { internalType: "uint256", name: "supplyShares", type: "uint256" },
      { internalType: "uint128", name: "borrowShares", type: "uint128" },
      { internalType: "uint128", name: "collateral", type: "uint128" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const

export const isMorphoTask = (task: LpTask) => task.protocol?.toLowerCase() === "morpho"

// A Morpho position is not an ERC20 balance: collateral lives inside the Morpho
// singleton, keyed by market id. The task's tokenAddress is a synthetic address
// made of the first 20 bytes of that id, so match markets on that prefix.
export async function getMorphoCollateral(task: LpTask, account: Address): Promise<bigint | undefined> {
  if (!USG_MORPHO) return undefined

  const market = Object.values(USG_MORPHO.MARKETS).find((m) => m.id.toLowerCase().startsWith(task.tokenAddress.toLowerCase()))
  if (!market) return undefined

  const [, , collateral] = await getPublicClient().readContract({
    address: USG_MORPHO.SINGLETON,
    abi: morphoPositionAbi,
    functionName: "position",
    args: [market.id as Hex, account],
  })

  return collateral
}

export const formatToken = (token: string): string => {
  if (token.includes("LP USDe") || token.includes("PT USDe") || token.includes("YT USDe")) {
    return "USDe"
  }

  if (token.includes("LP sUSDe") || token.includes("PT sUSDe") || token.includes("YT sUSDe")) {
    return "sUSDe"
  }

  return token.replaceAll("_", "-")
}

export const mapVoteTasksProtocol = (protocol: string) => {
  switch (protocol.toLowerCase()) {
    case "tangent":
      return "Tangent"

    case "cvx.eth":
    case "convex":
      return "Convex"

    case "curve":
    case "crv":
      return "Curve"

    case "fxn":
      return "f(x) Protocol"

    case "sdcrv.eth":
    case "sdfxn.eth":
    case "sdpendle.eth":
    case "stakedao":
      return "Stake DAO"
  }
}
