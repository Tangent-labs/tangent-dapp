import { executeChainViewUnique } from "@/services/service_rpc"
import { Abi, Address, Hex, WalletClient, zeroAddress } from "viem"
import GetBalances from "@/abi/tgusd/GetBalances.json"
import GetBalancesAllowances from "@/abi/tgusd/GetBalancesAllowances.json"
import { BalanceAllowanceData, ZapToken } from "../tg_usd_type"
import { TGUSD_CONTRACT } from "../tg_usd_repository"
import { getSwapAssetPrice } from "@/services/service_price"

export const getBalances = async (user: Address, tokens: Address[]) => {
  return await executeChainViewUnique<bigint[]>(GetBalances.abi as Abi, GetBalances.bytecode as Hex, [user, tokens])
}

export const getZapTokenBalanceAllowance = async (walletClient: WalletClient, address: Address | undefined) => {
  address = address || zeroAddress
  const [account] = await walletClient.requestAddresses()

  return await executeChainViewUnique<BalanceAllowanceData[]>(GetBalancesAllowances.abi as Abi, GetBalancesAllowances.bytecode as Hex, [
    account,
    [{ token: address, spenders: [TGUSD_CONTRACT.ZAPPER] }],
  ])
}

export const computeSwapAssetPrice = async (tokens: ZapToken[], depositAsset: string) => {
  try {
    const tokenAddress = tokens.find((el: ZapToken) => el.name === depositAsset) ? tokens.find((el: ZapToken) => el.name === depositAsset)?.address : undefined
    if (tokenAddress) {
      const data = await getSwapAssetPrice(tokenAddress)
      return data
    } else return null
  } catch (error) {
    console.error("Failed to compute swap asset price:", error)
    return null
  }
}
