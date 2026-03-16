"use client"

import { Abi, Hex } from "viem"
import sUSGUI from "../../../abi/USG/sUSGUI.json"
import { USG_CONTRACT } from "./usg_repository"
import { USGStakingInfo } from "./usg_type"
import { executeChainViewUnique } from "@/services/service_rpc"

export async function getUSGsUSGMetrics(currentAddress: string) {
  return await executeChainViewUnique<USGStakingInfo>(sUSGUI.abi as Abi, sUSGUI.bytecode as Hex, [
    currentAddress,
    USG_CONTRACT.USG_ORACLE,
    USG_CONTRACT.USG,
    USG_CONTRACT.SUSG,
  ])
}
