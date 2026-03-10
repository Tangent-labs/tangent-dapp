import { USG_CONTRACT } from "../usg/usg_repository"
import { Abi, Address, Hex, zeroAddress } from "viem"
import { executeChainViewUnique } from "@/services/service_rpc"
import GetBalancesWithVsTan from "../../../abi/USG/GetBalancesWithVsTan.json"

export const getUserBalances = async (currentAddress: Address) => {
  const tokenMap: Record<string, string> = {
    [USG_CONTRACT.USG.toLowerCase()]: "USG",
    [USG_CONTRACT.SUSG.toLowerCase()]: "sUSG",
  }

  const addresses = Object.keys(tokenMap)

  const balances = await executeChainViewUnique<Array<{ balance: bigint; token: Address }>>(
    GetBalancesWithVsTan.abi as Abi,
    GetBalancesWithVsTan.bytecode as Hex,
    [currentAddress, addresses, zeroAddress]
  )

  if (!balances) return []

  return balances.map((b) => ({
    address: b.token as Address,
    balance: b.balance,
    token: tokenMap[b.token.toLowerCase()] ?? "vsTAN",
  }))
}
