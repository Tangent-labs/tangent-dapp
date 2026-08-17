import VsTan from "../../../../abi/USG/VsTAN.json"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { isExpired } from "../rstan_layout_controller"
import { FormError, FormState, LockPosition } from "../../usg/usg_type"
import { Abi, Address, WalletClient } from "viem"
import { executeApprove, executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { dappErrors } from "@/components/design_system/notifications/dap-errors"
import { formatBigInt } from "@/lib/number_formatter"

export async function doApprove(walletClient: WalletClient, contract: Address, spender: Address, amount: bigint) {
  const txHash = await executeApprove(walletClient, contract, spender, amount)
  return await waitForTransaction(txHash)
}

export const doLock = async (depositWeiValue: bigint, walletClient: WalletClient, isPermaLock: boolean) => {
  const txData = {
    abi: VsTan.abi as Abi,
    functionName: "createLock",
    args: [depositWeiValue, isPermaLock],
    address: VSTAN_CONTRACT.VSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export const doIncreaseLockAmount = async (tokenId: bigint, depositWeiValue: bigint, walletClient: WalletClient) => {
  const txData = {
    abi: VsTan.abi as Abi,
    functionName: "increaseLockAmount",
    args: [tokenId, depositWeiValue],
    address: VSTAN_CONTRACT.VSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export function getLockFormState(
  lockBalanceAllowanceData: { balance: bigint; allowance: bigint },
  depositPositionInfo: LockPosition | undefined,
  depositWeiValue: bigint | undefined,
  isWellConnected: boolean,
  isNewPosition: boolean,
  minLock: bigint | undefined,
  chainTimestamp: bigint | undefined
): FormState {
  const errors: FormError[] = []

  if (!isWellConnected) {
    return { canProcess: false, errors: [dappErrors["no-wallet"]], haveToApprove: false }
  }

  // TAN is approved against the vsTAN contract, which pulls it on createLock / increaseLockAmount
  const isApproved = (depositWeiValue || 0n) <= (lockBalanceAllowanceData?.allowance || 0n)

  // Nothing typed yet : not an error to show the user, just nothing to process
  if (!depositWeiValue || depositWeiValue === 0n) {
    return { canProcess: false, errors: [], haveToApprove: !isApproved }
  }

  if ((lockBalanceAllowanceData?.balance || 0n) < depositWeiValue) {
    errors.push(dappErrors["balance"])
  }

  // createLock reverts with MinLockAmountNotReached below the minimum. increaseLockAmount doesn't
  // enforce it, so topping up an existing position with any amount is fine.
  if (isNewPosition && !!minLock && depositWeiValue < minLock) {
    errors.push({ ...dappErrors["min-lock"], subtitle: `A new position requires at least ${formatBigInt(minLock, 18, 2)} TAN.` })
  }

  // Topping up a position that already unlocked : it has to be withdrawn instead
  if (isExpired(depositPositionInfo, chainTimestamp)) {
    errors.push(dappErrors["lock-expired"])
  }

  return { canProcess: errors.length === 0 && isApproved, errors, haveToApprove: !isApproved }
}
