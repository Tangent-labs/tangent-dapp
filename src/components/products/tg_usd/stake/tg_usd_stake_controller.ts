import { Abi, Address, EstimateContractGasParameters, Hex, maxUint256, WalletClient, WriteContractParameters } from "viem"
import { executeChainViewUnique, getApproveTx, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import stakeSgUSD from "../../../../abi/tgusd/sgUsdStake.json"
import stakeUI from "../../../../abi/tgusd/sgUSDUI.json"
import { StakingInfo } from "../tg_usd_type"
import { TGUSD_CONTRACT } from "../tg_usd_repository"

export async function getTgUsdStakeOnChainData(currentAddress: Address | undefined) {
  return await executeChainViewUnique<StakingInfo>(stakeUI.abi as Abi, stakeUI.bytecode as Hex, [
    currentAddress,
    TGUSD_CONTRACT.TG_USD_ORACLE,
    TGUSD_CONTRACT.TG_USD,
    TGUSD_CONTRACT.SG_USD,
  ])
}

export const getExpectedTgUSD = async (walletClient: WalletClient, weiValue: bigint, stakingAddress: Address) => {
  const [account] = await walletClient.requestAddresses()

  const params = [weiValue]

  const publicClient = await getPublicClient()
  const txData = {
    abi: stakeSgUSD,
    functionName: "previewRedeem",
    args: params as unknown[],
    address: stakingAddress,
    account,
    gas: undefined as undefined | bigint,
  }
  const previewRedeem = (await publicClient.readContract(txData)) as bigint

  return previewRedeem
}

export const getExpectedSgUSD = async (walletClient: WalletClient, weiValue: bigint, stakingAddress: Address) => {
  const [account] = await walletClient.requestAddresses()

  const params = [weiValue]

  const publicClient = await getPublicClient()
  const txData = {
    abi: stakeSgUSD,
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
    abi: stakeSgUSD,
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
    abi: stakeSgUSD,
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
