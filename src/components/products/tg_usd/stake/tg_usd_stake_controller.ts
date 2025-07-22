import { Abi, Address, EstimateContractGasParameters, formatUnits, Hex, maxUint256, WalletClient, WriteContractParameters } from "viem"
import { executeChainViewUnique, getApproveTx, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import yearnV3Vault from "../../../../abi/tgusd/YearnV3Vault.json"
import stakeUI from "../../../../abi/tgusd/sgUSDUI.json"
import { StakingInfo } from "../tg_usd_type"
import { TGUSD_CONTRACT } from "../tg_usd_repository"

export async function getTgUsdStakeOnChainData(currentAddress: Address | undefined) {
  return await executeChainViewUnique<StakingInfo>(stakeUI.abi as Abi, stakeUI.bytecode as Hex, [
    currentAddress,
    TGUSD_CONTRACT.USG_ORACLE,
    TGUSD_CONTRACT.USG,
    TGUSD_CONTRACT.SUSG,
  ])
}

export function getFormState(stakeInfo: StakingInfo, currentFeature: "stake" | "unstake", weiValue?: bigint, expected?: bigint, isWellConnected?: boolean) {
  let isApproved = false
  const reasons: string[] = []

  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    isApproved = (currentFeature === "stake" && !!stakeInfo?.tgUSDAllowance && (weiValue || 0n) <= stakeInfo?.tgUSDAllowance) || currentFeature === "unstake"
    if (weiValue === 0n) {
      reasons.push("No amount.")
    } else if (currentFeature === "stake" && (weiValue || 0n) > (stakeInfo?.tgUSDBalance || 0n)) {
      reasons.push("Not enough balance.")
    } else if (currentFeature === "unstake" && (weiValue || 0n) > (stakeInfo?.sgUSDBalance || 0n)) {
      reasons.push("Not enough balance.")
    }
    if (!expected || expected === 0n) {
      reasons.push("")
    }
  }
  return { canProcess: isApproved && reasons.length === 0, cantProcessReasons: reasons, haveToApprove: !isApproved }
}

export const getExpectedTgUSD = async (walletClient: WalletClient, weiValue: bigint, stakingAddress: Address) => {
  const [account] = await walletClient.requestAddresses()

  const params = [weiValue]

  const publicClient = await getPublicClient()
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

  const publicClient = await getPublicClient()
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
  const publicClient = await getPublicClient()
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

  const publicClient = await getPublicClient()
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

  const publicClient = await getPublicClient()
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

export const computeProjection = (stakeInfo: StakingInfo, timeFrame: number, apr: number, addedLiquidity?: bigint) => {
  let projection = 0

  if (addedLiquidity) {
    projection =
      (Number(formatUnits(addedLiquidity, 18)) + Number(formatUnits(stakeInfo?.sgUSDBalance || 0n, 18))) * Math.pow(1 + apr / 100 / 26, 26 * timeFrame)
  } else {
    projection = Number(formatUnits(stakeInfo?.sgUSDBalance || 0n, 18)) * Math.pow(1 + apr / 100 / 26, 26 * timeFrame)
  }
  return projection
}
