import { dappErrors } from "@/components/design_system/notifications/dap-errors"
import { formatNumber } from "@/lib/number_formatter"
import { getApproveTx, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Address, EstimateContractGasParameters, formatUnits, maxUint256, parseAbi, WalletClient, WriteContractParameters } from "viem"
import yearnV3Vault from "../../../../abi/USG/YearnV3Vault.json"
import { FormError, FormState, USGStakingInfo } from "../usg_type"

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
      errors: [dappErrors["no-wallet"]],
      haveToApprove: false,
    }
  } else {
    isApproved = (currentFeature === "stake" && !!stakeInfo?.USGAllowance && (weiValue || 0n) <= stakeInfo?.USGAllowance) || currentFeature === "unstake"

    if (!weiValue || weiValue === 0n) {
      return { canProcess: false, errors: [], haveToApprove: true }
    } else {
      if (currentFeature === "stake" && weiValue > (stakeInfo?.USGBalance || 0n)) {
        errors.push(dappErrors["balance"])
      }
      if (currentFeature === "unstake" && weiValue > (stakeInfo?.sUSGBalance || 0n)) {
        errors.push(dappErrors["balance"])
      }
      if (expected === 0n) {
        errors.push(dappErrors["empty-form"])
      }
    }
  }

  return { canProcess: isApproved && !!expected && expected > 0n && errors.length === 0 && !isLoading, errors, haveToApprove: !isApproved }
}

// previewDeposit (assets -> shares) / previewRedeem (shares -> assets): plain reads, no wallet needed
export const getExpectedPreview = async (functionName: "previewDeposit" | "previewRedeem", weiValue: bigint, vault: Address) =>
  (await getPublicClient().readContract({ abi: yearnV3Vault, functionName, args: [weiValue], address: vault })) as bigint

export const doApprove = async (walletClient: WalletClient, assetAddress: Address, amount: bigint, stakingContract: Address) => {
  const publicClient = getPublicClient()
  amount = amount || maxUint256

  const txData = getApproveTx(walletClient, assetAddress, stakingContract, amount)
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

export const computedProjection = (amount: number, timeFrame: number, apy: number) => {
  return amount * Math.pow(1 + apy / 100, timeFrame)
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

// ────────────────────────────────────────
//      YEARN V3 VAULTS (Curve LP assets)
// ────────────────────────────────────────

const yearnV3Abi = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function convertToAssets(uint256) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function get_virtual_price() view returns (uint256)",
])

const MULTICALL3: Address = "0xcA11bde05977b3631167028862bE2a173976CA11"

// Returned in the USGStakingInfo shape (asset = USG* slots, vault share = sUSG* slots) so the sUSG form/panel is reused.
// ponytail: LP priced at get_virtual_price (≈ $1 per pool unit), use an oracle if a pool drifts from peg.
export const getYearnV3Metrics = async (account: Address, lp: Address, vault: Address): Promise<USGStakingInfo> => {
  const [lpBalance, lpAllowance, shareBalance, assetsPerShare, shareSupply, virtualPrice] = await getPublicClient().multicall({
    multicallAddress: MULTICALL3,
    allowFailure: false,
    contracts: [
      { address: lp, abi: yearnV3Abi, functionName: "balanceOf", args: [account] },
      { address: lp, abi: yearnV3Abi, functionName: "allowance", args: [account, vault] },
      { address: vault, abi: yearnV3Abi, functionName: "balanceOf", args: [account] },
      { address: vault, abi: yearnV3Abi, functionName: "convertToAssets", args: [10n ** 18n] },
      { address: vault, abi: yearnV3Abi, functionName: "totalSupply" },
      { address: lp, abi: yearnV3Abi, functionName: "get_virtual_price" },
    ],
  })

  return {
    USGBalance: lpBalance,
    USGAllowance: lpAllowance,
    USGPrice: virtualPrice,
    USGSupply: 0n,
    USGPercentageInsUSG: 0n,
    sUSGBalance: shareBalance,
    sUSGPrice: (assetsPerShare * virtualPrice) / 10n ** 18n,
    sUSGSupply: shareSupply,
  }
}
