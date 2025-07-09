import { executeContractCall, getApproveTx, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Abi, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"
import RsTan from "../../../../abi/tgusd/RsTan.json"
import { LockPosition } from "../../tg_usd/tg_usd_type"
import { RSTAN_CONTRACT } from "../rs_tan_repository"

export const doApprove = async (depositWeiValue: bigint, walletClient: WalletClient) => {
  const publicClient = getPublicClient()

  const txData = getApproveTx(RSTAN_CONTRACT.TAN, RSTAN_CONTRACT.VSTAN, depositWeiValue)

  const gas = await publicClient.estimateContractGas(txData as EstimateContractGasParameters)
  txData.gas = gas
  const hash = await walletClient.writeContract(txData as WriteContractParameters)

  return await waitForTransaction(hash)
}

export const doLock = async (depositWeiValue: bigint, walletClient: WalletClient, isPermaLock: boolean) => {
  const txData = {
    abi: RsTan.abi as Abi,
    functionName: "createLock",
    args: [depositWeiValue, isPermaLock],
    address: RSTAN_CONTRACT.VSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export const doIncreaseLockAmount = async (tokenId: bigint, depositWeiValue: bigint, walletClient: WalletClient) => {
  const txData = {
    abi: RsTan.abi as Abi,
    functionName: "increaseLockAmount",
    args: [tokenId, depositWeiValue],
    address: RSTAN_CONTRACT.VSTAN,
  }

  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export async function getLockFormState(
  balance: bigint,
  allowance: bigint,
  depositPositionInfo: LockPosition | undefined,
  depositWeiValue: bigint,
  isWellConnected: boolean
) {
  const reasons: string[] = []

  const publicClient = await getPublicClient()
  const currentBlockNumber = await publicClient.getBlockNumber()
  const block = await publicClient.getBlock({ blockNumber: currentBlockNumber })

  const isApproved = (depositWeiValue || 0n) <= (allowance || 0n)

  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    if (balance < depositWeiValue) {
      reasons.push("Not enough balance.")
    }
    if (!depositWeiValue || depositWeiValue === 0n) {
      reasons.push("No amount.")
    }
    if (!!depositPositionInfo?.endLockTime && block.timestamp > Number(depositPositionInfo?.endLockTime)) {
      reasons.push("Lock expired.")
    }
  }
  return { canProcess: reasons.length === 0, cantProcessReasons: reasons, haveToApprove: !isApproved }
}
