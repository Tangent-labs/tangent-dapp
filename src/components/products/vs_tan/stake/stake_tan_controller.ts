import { dappErrors } from "@/components/design_system/notifications/form-errors"
import { formatNumber } from "@/lib/number_formatter"
import { executeChainViewUnique, getApproveTx, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Abi, Address, EstimateContractGasParameters, formatUnits, Hex, maxUint256, WalletClient, WriteContractParameters } from "viem"
import sTANUI from "../../../../abi/USG/sTANUI.json"
import yearnV3Vault from "../../../../abi/USG/YearnV3Vault.json"
import { FormError, FormState } from "../../usg/usg_type"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { TANStakingInfo } from "../rstan_types"

export async function getTanStakeOnChainData(currentAddress: string) {
  return await executeChainViewUnique<TANStakingInfo>(sTANUI.abi as Abi, sTANUI.bytecode as Hex, [
    currentAddress,
    VSTAN_CONTRACT.TAN_LP,
    VSTAN_CONTRACT.ETH_ORACLE,
    VSTAN_CONTRACT.TAN,
    VSTAN_CONTRACT.STAN,
    VSTAN_CONTRACT.DAO,
  ])
}

export function getTanStakeFormState(
  stakeInfo: TANStakingInfo,
  currentFeature: "stake" | "unstake",
  weiValue?: bigint,
  expected?: bigint,
  isWellConnected?: boolean
): FormState {
  const errors: FormError[] = []
  let isApproved = false

  if (!isWellConnected) {
    errors.push(dappErrors["no-wallet"])
  } else {
    isApproved = (currentFeature === "stake" && !!stakeInfo?.tanAllowance && (weiValue || 0n) <= stakeInfo?.tanAllowance) || currentFeature === "unstake"

    if (!weiValue || weiValue === 0n) {
      errors.push(dappErrors["empty-form"])
    } else {
      if (currentFeature === "stake" && weiValue > (stakeInfo?.tanBalance || 0n)) {
        errors.push(dappErrors["balance"])
      }
      if (currentFeature === "unstake" && weiValue > (stakeInfo?.sTanBalance || 0n)) {
        errors.push(dappErrors["balance"])
      }
      if (!expected || expected === 0n) {
        errors.push(dappErrors["empty-form"])
      }
    }
  }

  return { canProcess: isApproved && errors.length === 0, errors, haveToApprove: !isApproved }
}

export const getExpectedTAN = async (walletClient: WalletClient, weiValue: bigint, stakingAddress: Address) => {
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

export const getExpectedsTAN = async (walletClient: WalletClient, weiValue: bigint, stakingAddress: Address) => {
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

  const txData = getApproveTx(walletClient, assetAddress, stakingContract, amount)
  const gas = await publicClient.estimateContractGas(txData as unknown as EstimateContractGasParameters)
  txData.gas = gas
  const hash = await walletClient.writeContract(txData as unknown as WriteContractParameters)
  return await waitForTransaction(hash)
}

export const doUnstakeTAN = async ({ walletClient, stakingAddress, weiValue }: { walletClient: WalletClient; stakingAddress: Address; weiValue: bigint }) => {
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
  return await waitForTransaction(hash)
}

export const doStakeTAN = async ({ walletClient, stakingAddress, weiValue }: { walletClient: WalletClient; stakingAddress: Address; weiValue: bigint }) => {
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
  return await waitForTransaction(hash)
}

export const computedProjection = (amount: number, timeFrame: number, apy: number) => {
  return amount * Math.pow(1 + apy / 100, timeFrame)
}

// Mirrors the sUSG projection so both staking pages compound identically
export const computeProjection = (sTanBalance: bigint, timeFrame: number, apr: number, currentFeature: "stake" | "unstake", amount?: bigint) => {
  let projection = 0
  const sTanBalanceNumb = Number(formatUnits(sTanBalance || 0n, 18))
  const amountNumb = Number(formatUnits(amount || 0n, 18))

  if (currentFeature === "stake" && !!amount && amount > 0n) {
    projection = computedProjection(sTanBalanceNumb + amountNumb, timeFrame, apr)
  } else if (currentFeature === "unstake" && !!amount && amount > 0n) {
    projection = computedProjection(sTanBalanceNumb - amountNumb, timeFrame, apr)
  } else {
    projection = computedProjection(sTanBalanceNumb, timeFrame, apr)
  }

  return formatNumber(projection >= 0 ? projection : 0, 0)
}
