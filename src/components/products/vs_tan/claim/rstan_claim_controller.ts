import { executeContractCall, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { USG_CONTRACT } from "../../usg/usg_repository"
import VsTAN from "../../../../abi/USG/VsTAN.json"
import { Abi, WalletClient } from "viem"
import { FormError, FormState, LockPosition } from "../../usg/usg_type"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { dappErrors } from "@/components/design_system/notifications/dap-errors"

export const totalClaimable = (positions: LockPosition[] | undefined) => (positions || []).reduce((total, position) => total + position.claimable, 0n)

// Rewards accrue in USG. Claiming as sUSG runs sUSG.deposit(rewardAmount), so the amount actually
// received is the vault's share equivalent, not the USG figure — 1 sUSG is worth more than 1 USG.
const erc4626Abi = [
  { inputs: [{ type: "uint256" }], name: "convertToShares", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
] as const

export const getSUsgShares = async (usgAmount: bigint): Promise<bigint> => {
  const publicClient = getPublicClient()

  return await publicClient.readContract({ address: USG_CONTRACT.SUSG, abi: erc4626Abi, functionName: "convertToShares", args: [usgAmount] })
}

export function getClaimFormState(selectedPositions: LockPosition[], hasDuplicates: boolean, isWellConnected: boolean): FormState {
  const errors: FormError[] = []

  if (!isWellConnected) {
    return { canProcess: false, errors: [dappErrors["no-wallet"]], haveToApprove: false }
  }

  // Nothing picked yet : not an error to show the user, just nothing to process
  if (!selectedPositions?.length) {
    return { canProcess: false, errors: [], haveToApprove: false }
  }

  if (hasDuplicates) {
    errors.push(dappErrors["duplicate-position"])
  }

  // Positions with no accrued rewards are filtered out before the call, so claiming only those
  // would send an empty selection to the contract
  if (totalClaimable(selectedPositions) === 0n) {
    errors.push(dappErrors["nothing-to-claim"])
  }

  // Claiming transfers out of vsTAN, there is nothing to approve
  return { canProcess: errors.length === 0, errors, haveToApprove: false }
}

export const doClaim = async (positions: LockPosition[], walletClient: WalletClient, claimAsSUSG: boolean) => {
  const method = positions?.length === 1 ? "claimSimple" : "claimMultiple"

  const params = positions?.length === 1 ? positions?.[0]?.tokenId : positions?.map((el: LockPosition) => el.tokenId)

  const txData = {
    abi: VsTAN.abi as Abi,
    functionName: method,
    args: [params, claimAsSUSG],
    address: VSTAN_CONTRACT.VSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}
