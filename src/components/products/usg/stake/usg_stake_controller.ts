import { USGStakingInfo } from "../usg_type"
import { formatNumber } from "@/lib/number_formatter"
import yearnV3Vault from "../../../../abi/USG/YearnV3Vault.json"
import { getApproveTx, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Address, EstimateContractGasParameters, formatUnits, maxUint256, WalletClient, WriteContractParameters } from "viem"

export function getFormState(stakeInfo: USGStakingInfo, currentFeature: "stake" | "unstake", weiValue?: bigint, expected?: bigint, isWellConnected?: boolean) {
  let isApproved = false
  const reasons: string[] = []

  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    isApproved = (currentFeature === "stake" && !!stakeInfo?.USGAllowance && (weiValue || 0n) <= stakeInfo?.USGAllowance) || currentFeature === "unstake"
    if (weiValue === 0n) {
      reasons.push("No amount.")
    } else if (currentFeature === "stake" && (weiValue || 0n) > (stakeInfo?.USGBalance || 0n)) {
      reasons.push("Not enough balance.")
    } else if (currentFeature === "unstake" && (weiValue || 0n) > (stakeInfo?.sUSGBalance || 0n)) {
      reasons.push("Not enough balance.")
    }
    if (!expected || expected === 0n) {
      reasons.push("")
    }
  }
  return { canProcess: isApproved && reasons.length === 0, cantProcessReasons: reasons, haveToApprove: !isApproved }
}

export const getExpectedUSG = async (walletClient: WalletClient, weiValue: bigint, stakingAddress: Address) => {
  const [account] = await walletClient.requestAddresses()

  const params = [weiValue]

  const publicClient = getPublicClient()
  const txData = {
    abi: yearnV3Vault,
    functionName: "previewRedeem",
    args: params as unknown[],
    address: stakingAddress,
    account,
    gas: undefined as undefined | bigint,
  }
  const previewRedeem = (await publicClient.readContract(txData)) as bigint

  return previewRedeem
}

export const getExpectedSUSG = async (walletClient: WalletClient, weiValue: bigint, stakingAddress: Address) => {
  const [account] = await walletClient.requestAddresses()

  const params = [weiValue]

  const publicClient = getPublicClient()
  const txData = {
    abi: yearnV3Vault,
    functionName: "previewDeposit",
    args: params as unknown[],
    address: stakingAddress,
    account,
    gas: undefined as undefined | bigint,
  }
  const previewDeposit = (await publicClient.readContract(txData)) as bigint

  return previewDeposit
}

export const doApprove = async (walletClient: WalletClient, assetAddress: Address, amount: bigint, stakingContract: Address) => {
  const publicClient = getPublicClient()
  amount = amount || maxUint256

  const txData = getApproveTx(assetAddress, stakingContract, amount)
  const gas = await publicClient.estimateContractGas(txData as unknown as EstimateContractGasParameters)
  txData.gas = gas
  const hash = await walletClient.writeContract(txData as unknown as WriteContractParameters)
  return await waitForTransaction(hash)
}

export const doUnstakeTgUSD = async ({ walletClient, stakingAddress, weiValue }: { walletClient: WalletClient; stakingAddress: Address; weiValue: bigint }) => {
  const [account] = await walletClient.requestAddresses()

  const params = [weiValue, account, account]

  const publicClient = getPublicClient()
  const txData = {
    abi: yearnV3Vault,
    functionName: "redeem",
    args: params as unknown[],
    address: stakingAddress,
    account,
    gas: undefined as undefined | bigint,
  }
  const gas = await publicClient.estimateContractGas(txData)
  txData.gas = gas

  const hash = await walletClient.writeContract(txData as unknown as WriteContractParameters)
  return hash
}

export const doStakeTgUSD = async ({ walletClient, stakingAddress, weiValue }: { walletClient: WalletClient; stakingAddress: Address; weiValue: bigint }) => {
  const [account] = await walletClient.requestAddresses()

  const params = [weiValue, account]

  const publicClient = getPublicClient()
  const txData = {
    abi: yearnV3Vault,
    functionName: "deposit",
    args: params as unknown[],
    address: stakingAddress,
    account,
    gas: undefined as undefined | bigint,
  }
  const gas = await publicClient.estimateContractGas(txData)
  txData.gas = gas

  const hash = await walletClient.writeContract(txData as unknown as WriteContractParameters)
  return hash
}

export const computeProjection = (stakeInfo: USGStakingInfo, timeFrame: number, apr: number, addedLiquidity?: bigint) => {
  let projection = 0

  if (addedLiquidity) {
    projection =
      (Number(formatUnits(addedLiquidity, 18)) + Number(formatUnits(stakeInfo?.sUSGBalance || 0n, 18))) * Math.pow(1 + apr / 100 / 26, 26 * timeFrame)
  } else {
    projection = Number(formatUnits(stakeInfo?.sUSGBalance || 0n, 18)) * Math.pow(1 + apr / 100 / 26, 26 * timeFrame)
  }
  return formatNumber(projection, 0)
}
