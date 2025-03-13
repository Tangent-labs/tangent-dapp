import { executeContractCall, getApproveTx, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { TGUSD_CONTRACT } from "../../tg_usd/tg_usd_repository"
import { Abi, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"
import RsTan from "../../../../abi/tgusd/RsTan.json"

export const doApprove = async (depositWeiValue: bigint, walletClient: WalletClient) => {
  const publicClient = await getPublicClient()

  const txData = getApproveTx(TGUSD_CONTRACT.TAN, TGUSD_CONTRACT.RSTAN, depositWeiValue)

  const gas = await publicClient.estimateContractGas(txData as EstimateContractGasParameters)
  txData.gas = gas

  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return await waitForTransaction(hash)
}

export const doLock = async (depositWeiValue: bigint, walletClient: WalletClient, isPermaLock: boolean) => {
  const txData = {
    abi: RsTan.abi as Abi,
    functionName: "createLock",
    args: [depositWeiValue, isPermaLock, TGUSD_CONTRACT.ZAPPER],
    address: TGUSD_CONTRACT.RSTAN,
  }
  return await executeContractCall(walletClient, txData)
}

export const doIncreaseLockAmount = async (tokenId: bigint, depositWeiValue: bigint, walletClient: WalletClient) => {
  const txData = {
    abi: RsTan.abi as Abi,
    functionName: "increaseLockAmount",
    args: [tokenId, depositWeiValue, TGUSD_CONTRACT.ZAPPER],
    address: TGUSD_CONTRACT.RSTAN,
  }
  return await executeContractCall(walletClient, txData)
}

export function getLockFormState(allowance: bigint, depositWeiValue: bigint, isWellConnected: boolean) {
  const reasons: string[] = []

  const isApproved = (depositWeiValue || 0n) <= (allowance || 0n)

  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    if (!depositWeiValue || depositWeiValue === 0n) {
      reasons.push("No amount.")
    }
  }
  return { canProcess: reasons.length === 0, cantProcessReasons: reasons, haveToApprove: !isApproved }
}
