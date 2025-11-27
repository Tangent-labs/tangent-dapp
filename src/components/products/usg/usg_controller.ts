"use server"

import { Abi, Hex } from "viem"
import sUSGUI from "../../../abi/USG/sUSGUI.json"
import { USG_CONTRACT } from "./usg_repository"
import { USGStakingInfo, ZapToken } from "./usg_type"
import { executeChainViewUnique } from "@/services/service_rpc"

export async function fetchTokens() {
  const tokensData = await fetch("https://files.cow.fi/tokens/CowSwap.json")
  const { tokens } = await tokensData.json()
  return tokens.filter((el: ZapToken) => !!el.chainId && el.chainId === 1)
}

export async function getUSGsUSGMetrics(currentAddress: string) {
  return await executeChainViewUnique<USGStakingInfo>(sUSGUI.abi as Abi, sUSGUI.bytecode as Hex, [
    currentAddress,
    USG_CONTRACT.USG_ORACLE,
    USG_CONTRACT.USG,
    USG_CONTRACT.SUSG,
  ])
}
