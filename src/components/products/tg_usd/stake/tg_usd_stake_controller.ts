import { Abi, Address, EstimateContractGasParameters, Hex, maxUint256, WalletClient, WriteContractParameters } from "viem"
import { executeChainViewUnique, getApproveTx, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import stakeSgUSD from "../../../../abi/tgusd/sgUsdStake.json"
import stakeUI from "../../../../abi/tgusd/sgUSDUI.json"
import { formatBigInt } from "@/lib/number_formatter"
import { StakingInfo } from "../tg_usd_type"
import { TGUSD_CONTRACT } from "../tg_usd_repository"

export async function getTgUsdStakeOnChainData() {
  return await executeChainViewUnique<StakingInfo>(stakeUI.abi as Abi, stakeUI.bytecode as Hex, [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0xfDb6669cF60C1dBfB0f72Ea50A6eC5e0FD6089E1",
    TGUSD_CONTRACT.TG_USD,
    "0x374039ebeed6a9185b1ccf320daa2301f26246f6",
  ])
}

export const getExpectedSdAsset = async (weiValue: bigint, sgUSDPrice: bigint) => {
  const sgUSDPriceAsNumber = Number(formatBigInt(sgUSDPrice, 18, 2))
  return { sdAssetAmountOut: weiValue * BigInt(sgUSDPriceAsNumber) }
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
