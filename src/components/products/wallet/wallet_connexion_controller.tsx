import { Abi, Address, Hex } from "viem"
import { USG_CONTRACT } from "../tg_usd/tg_usd_repository"
import { VSTAN_CONTRACT } from "../vs_tan/rs_tan_repository"
import { executeChainViewUnique } from "@/services/service_rpc"
import GetBalancesWithVsTan from "../../../abi/USG/GetBalancesWithVsTan.json"

export const getUserBalances = async (currentAddress: Address) => {
  const tokenMap: Record<string, string> = {
    [USG_CONTRACT.USG.toLowerCase()]: "USG",
    [USG_CONTRACT.SUSG.toLowerCase()]: "sUSG",
    [VSTAN_CONTRACT.TAN.toLowerCase()]: "TAN",
    [VSTAN_CONTRACT.STAN.toLowerCase()]: "sTAN",
  }

  const addresses = Object.keys(tokenMap)

  const balances = await executeChainViewUnique<Array<{ balance: bigint; token: Address }>>(
    GetBalancesWithVsTan.abi as Abi,
    GetBalancesWithVsTan.bytecode as Hex,
    [currentAddress, addresses, VSTAN_CONTRACT.VSTAN]
  )

  if (!balances) return []

  return balances.map((b) => ({
    address: b.token as Address,
    balance: b.balance,
    token: tokenMap[b.token.toLowerCase()] ?? "vsTAN",
  }))
}
