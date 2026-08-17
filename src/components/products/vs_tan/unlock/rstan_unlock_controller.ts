import { executeContractCall, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import VsTan from "../../../../abi/USG/VsTAN.json"
import { Abi, Address, WalletClient } from "viem"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { isPermaLocked } from "../rstan_layout_controller"
import { dappErrors } from "@/components/design_system/notifications/dap-errors"
import { FormError, FormState, LockPosition } from "../../usg/usg_type"

export type UnlockMode = "none" | "perma" | "locked" | "expired" | "kickable"

export type KickParams = { delay: bigint; percentage: bigint }

// kick().percentage is parts-per-100k: 250 == 0.25%
export const KICK_PERCENTAGE_DENOMINATOR = 100000n

const THIRTEEN_WEEKS_IN_MS = 13 * 7 * 24 * 60 * 60 * 1000

export function getUnlockMode(position: LockPosition | undefined, nowSec: number, kickParams: KickParams | undefined): UnlockMode {
  if (!position) return "none"

  if (isPermaLocked(position)) return "perma"

  const endLockTimeSec = Number(position.endLockTime)

  if (endLockTimeSec > nowSec) return "locked"

  if (kickParams && nowSec >= endLockTimeSec + Number(kickParams.delay)) return "kickable"

  return "expired"
}

export function getUnlockFormState(isWellConnected: boolean, mode: UnlockMode): FormState {
  const errors: FormError[] = []

  if (!isWellConnected) errors.push(dappErrors["no-wallet"])

  if (mode === "none") errors.push(dappErrors["no-position-selected"])

  // no ERC-20 approval is ever needed to unlock/rageQuit/kick/togglePermaLock
  return { canProcess: errors.length === 0, errors, haveToApprove: false }
}

export function getUnlockPreview(position: LockPosition | undefined, mode: UnlockMode, nowMs: number): { tanReceived: bigint; tanForfeited: bigint } {
  if (!position || mode === "none" || mode === "perma") return { tanReceived: 0n, tanForfeited: 0n }

  if (mode === "expired" || mode === "kickable") return { tanReceived: position.amount, tanForfeited: 0n }

  const endLockTimeMs = Number(position.endLockTime) * 1000
  const penalty = Math.max(0, Math.min(1, (endLockTimeMs - nowMs) / THIRTEEN_WEEKS_IN_MS))
  const tanReceived = (position.amount * BigInt(Math.round((1 - penalty) * 1000000))) / 1000000n

  return { tanReceived, tanForfeited: position.amount - tanReceived }
}

export const getKickBounty = (amount: bigint, percentage: bigint): bigint => {
  return (amount * percentage) / KICK_PERCENTAGE_DENOMINATOR
}

export const doUnlock = async (walletClient: WalletClient, tokenId: bigint, method: "unlock" | "rageQuit", claimAsSUSG: boolean) => {
  const txData = {
    abi: VsTan.abi as Abi,
    functionName: method,
    args: [tokenId, claimAsSUSG],
    address: VSTAN_CONTRACT.VSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export const doKickPosition = async (walletClient: WalletClient, tokenId: bigint, receiver: Address) => {
  const txData = {
    abi: VsTan.abi as Abi,
    functionName: "kickPosition",
    args: [tokenId, receiver],
    address: VSTAN_CONTRACT.VSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export const getKickParams = async (): Promise<KickParams | undefined> => {
  try {
    const [delay, percentage] = (await getPublicClient().readContract({
      abi: VsTan.abi as Abi,
      functionName: "kick",
      address: VSTAN_CONTRACT.VSTAN,
    })) as [bigint, bigint]

    return { delay, percentage }
  } catch {
    return undefined
  }
}
