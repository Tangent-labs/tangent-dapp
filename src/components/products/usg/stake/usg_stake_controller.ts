import { FormError, FormState, USGStakingInfo } from "../usg_type"
import { formatNumber } from "@/lib/number_formatter"
import yearnV3Vault from "../../../../abi/USG/YearnV3Vault.json"
import { getApproveTx, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Address, EstimateContractGasParameters, formatUnits, maxUint256, WalletClient, WriteContractParameters } from "viem"

export const COMPOUNDING_PERIODS_PER_YEAR = 52

export function getStakeFormState(
  stakeInfo: USGStakingInfo,
  currentFeature: "stake" | "unstake",
  weiValue?: bigint,
  expected?: bigint,
  isWellConnected?: boolean,
  isLoading?: boolean
): FormState {
  const errors: FormError[] = []
  let isApproved = false

  if (!isWellConnected) {
    return {
      canProcess: false,
      errors: [
        {
          key: "no-wallet",
          title: "No connected wallet",
          subtitle: "You need to connect your wallet to proceed.",
          content: "Please connect your wallet to repay.",
          type: null,
        },
      ],
      haveToApprove: false,
    }
  } else {
    isApproved = (currentFeature === "stake" && !!stakeInfo?.USGAllowance && (weiValue || 0n) <= stakeInfo?.USGAllowance) || currentFeature === "unstake"

    if (!weiValue || weiValue === 0n) {
      return { canProcess: false, errors: [], haveToApprove: true }
    } else {
      if (currentFeature === "stake" && weiValue > (stakeInfo?.USGBalance || 0n)) {
        errors.push({
          key: "balance",
          title: "Insufficient Balance",
          subtitle: "You don't have enough USG to stake this amount.",
          content: "Please reduce your stake amount or acquire more USG.",
          type: "form-alert",
        })
      }
      if (currentFeature === "unstake" && weiValue > (stakeInfo?.sUSGBalance || 0n)) {
        errors.push({
          key: "balance",
          title: "Insufficient Balance",
          subtitle: "You don't have enough sUSG to unstake this amount.",
          content: "Please reduce your unstake amount.",
          type: "form-alert",
        })
      }
      if (!expected || expected === 0n) {
        errors.push({
          key: "empty-form",
          title: "Quote Unavailable",
          subtitle: "The expected output hasn't loaded yet.",
          content: "Please wait for the quote to be calculated before proceeding.",
          type: "form-alert",
        })
      }
    }
  }

  return { canProcess: isApproved && errors.length === 0 && !isLoading, errors, haveToApprove: !isApproved }
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

export const doUnstakeUSG = async ({ walletClient, stakingAddress, weiValue }: { walletClient: WalletClient; stakingAddress: Address; weiValue: bigint }) => {
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

export const doStakeUSG = async ({ walletClient, stakingAddress, weiValue }: { walletClient: WalletClient; stakingAddress: Address; weiValue: bigint }) => {
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

export const computedProjection = (amount: number, timeFrame: number, apr: number) => {
  return amount * Math.pow(1 + apr / 100 / COMPOUNDING_PERIODS_PER_YEAR, COMPOUNDING_PERIODS_PER_YEAR * timeFrame)
}

export const computeProjection = (sUSGBalance: bigint, timeFrame: number, apr: number, currentFeature: "stake" | "unstake", amount?: bigint) => {
  let projection = 0
  const sUSGBalanceNumb = Number(formatUnits(sUSGBalance || 0n, 18))
  const amountNumb = Number(formatUnits(amount || 0n, 18))

  if (currentFeature === "stake" && !!amount && amount > 0n) {
    projection = computedProjection(sUSGBalanceNumb + amountNumb, timeFrame, apr)
  } else if (currentFeature === "unstake" && !!amount && amount > 0n) {
    projection = computedProjection(sUSGBalanceNumb - amountNumb, timeFrame, apr)
  } else {
    projection = computedProjection(sUSGBalanceNumb, timeFrame, apr)
  }

  return formatNumber(projection >= 0 ? projection : 0, 0)
}

export const computeSUSGAprVariation = (currentFeature: string, USGsUSGMetrics: USGStakingInfo, inputValue: bigint, currentAPY: number) => {
  let newAPR = 0n
  const numerator = USGsUSGMetrics?.sUSGSupply * BigInt((currentAPY * 100).toFixed(0))
  if (currentFeature === "stake") {
    newAPR = numerator / (USGsUSGMetrics?.sUSGSupply + inputValue || 1n)
  } else {
    newAPR = numerator / (USGsUSGMetrics?.sUSGSupply - inputValue || 1n)
  }

  return {
    current: `${currentAPY.toFixed(2)}% =>`,
    updated: `${(Number(newAPR) / 100).toFixed(2)}%`,
  }
}
