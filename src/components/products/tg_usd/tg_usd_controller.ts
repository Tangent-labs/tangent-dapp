"use server"

import { Abi, Address, Hex } from "viem"
import sUSGUI from "../../../abi/USG/sUSGUI.json"
import { USG_CONTRACT } from "./tg_usd_repository"
import { StakingInfo, ZapToken } from "./tg_usd_type"
import { executeChainViewUnique } from "@/services/service_rpc"

export async function fetchTokens() {
  const tokensData = await fetch("https://files.cow.fi/tokens/CowSwap.json")
  const { tokens } = await tokensData.json()
  return tokens.filter((el: ZapToken) => !!el.chainId && el.chainId === 1)
}

export async function getUSGsUSGMetrics(currentAddress: Address | undefined) {
  return await executeChainViewUnique<StakingInfo>(sUSGUI.abi as Abi, sUSGUI.bytecode as Hex, [
    currentAddress,
    USG_CONTRACT.USG_ORACLE,
    USG_CONTRACT.USG,
    USG_CONTRACT.SUSG,
  ])
}
