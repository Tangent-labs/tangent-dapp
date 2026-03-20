"use client"

import { Abi, Address, Hex } from "viem"
import sUSGUI from "../../../abi/USG/sUSGUI.json"
import { USG_CONTRACT } from "./usg_repository"
import { PointsResult, USGStakingInfo } from "./usg_type"
import { executeChainViewUnique } from "@/services/service_rpc"
import { getPoints } from "./client_api"

export async function getUSGsUSGMetrics(currentAddress: string) {
  return await executeChainViewUnique<USGStakingInfo>(sUSGUI.abi as Abi, sUSGUI.bytecode as Hex, [
    currentAddress,
    USG_CONTRACT.USG_ORACLE,
    USG_CONTRACT.USG,
    USG_CONTRACT.SUSG,
  ])
}

interface PointsCache {
  timestamp: number
  wallet: Address
  data: PointsResult
}

const POINTS_CACHE_KEY = "points_cache"
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
export async function getPointsDetails(currentAddress: Address, currentBlockTimestamp: number) {
  const cached = localStorage.getItem(POINTS_CACHE_KEY)

  const currentDate = new Date(currentBlockTimestamp * 1000)

  const dateFrom = encodeURIComponent(currentDate.toISOString())

  if (cached) {
    const parsed: PointsCache = JSON.parse(cached)

    if (currentBlockTimestamp - parsed.timestamp < CACHE_TTL && parsed.wallet === currentAddress) {
      return parsed.data
    }
  }

  const points = await getPoints(currentAddress, dateFrom)

  localStorage.setItem(POINTS_CACHE_KEY, JSON.stringify({ timestamp: currentBlockTimestamp, data: points }))

  return points
}
