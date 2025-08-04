import { executeApprove, executeContractCall, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Abi, Address, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"
import VsTan from "../../../../abi/tgusd/VsTAN.json"
import { BalanceAllowanceData, LockPosition, ZapMarketData } from "../../tg_usd/tg_usd_type"
import { VSTAN_CONTRACT } from "../rs_tan_repository"

export async function doApprove(walletClient: WalletClient, contract: Address, spender: Address, amount: bigint) {
  const txHash = await executeApprove(walletClient, contract, spender, amount)
  return await waitForTransaction(txHash)
}

export const doZapAndIncreaseLock = async (
  marketAddress: Address,
  walletClient: WalletClient,
  zapMarket: ZapMarketData,
  zapLockData: { routerAddress: string; data: string },
  tokenId: bigint
) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = await getPublicClient()

  const estimateGasData = {
    abi: VsTan.abi,
    functionName: "zapIncreaseLockAmount",
    args: [
      tokenId,
      {
        tokenIn: zapMarket?.tokenIn,
        amountIn: zapMarket?.amountIn,
        minAmountOut: zapMarket?.minAmountOut,
        zap: { router: zapLockData?.routerAddress, routerCall: zapLockData?.data },
      },
    ] as unknown[],
    address: marketAddress,
    account,
    value: 0n,
  } as EstimateContractGasParameters

  if (zapMarket?.tokenIn === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    estimateGasData.value = zapMarket?.amountIn
  }

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return hash
}

export const doZapAndLock = async (
  marketAddress: Address,
  walletClient: WalletClient,
  zapMarket: ZapMarketData,
  zapLockData: { routerAddress: string; data: string },
  isPermaLock: boolean
) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = await getPublicClient()

  const estimateGasData = {
    abi: VsTan.abi,
    functionName: "zapCreateLock",
    args: [
      isPermaLock,
      {
        tokenIn: zapMarket?.tokenIn,
        amountIn: zapMarket?.amountIn,
        minAmountOut: zapMarket?.minAmountOut,
        zap: { router: zapLockData?.routerAddress, routerCall: zapLockData?.data },
      },
    ] as unknown[],
    address: marketAddress,
    account,
    value: 0n,
  } as EstimateContractGasParameters

  if (zapMarket?.tokenIn === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    estimateGasData.value = zapMarket?.amountIn
  }

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return hash
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

export async function getLockFormState(
  balance: bigint,
  allowance: bigint,
  balanceAllowanceData: BalanceAllowanceData,
  depositPositionInfo: LockPosition | undefined,
  depositWeiValue: bigint,
  depositAsset: string,
  isWellConnected: boolean
) {
  const isZapMode = depositAsset !== "TAN"

  const reasons: string[] = []

  const publicClient = await getPublicClient()
  const currentBlockNumber = await publicClient.getBlockNumber()
  const block = await publicClient.getBlock({ blockNumber: currentBlockNumber })

  const isApproved =
    (!isZapMode && (depositWeiValue || 0n) <= (allowance || 0n)) ||
    (isZapMode && (depositWeiValue || 0n) <= (balanceAllowanceData?.allowances[0]?.allowance || 0n))

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
