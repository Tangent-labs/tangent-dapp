import VsTan from "../../../../abi/USG/VsTAN.json"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { FormError, FormState, LockPosition, ZapMarketData } from "../../usg/usg_type"
import { Abi, Address, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"
import { executeApprove, executeContractCall, getCurrentBlock, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { dappErrors } from "@/components/design_system/notifications/dap-errors"
import { NATIVE_ETH_ADDRESS } from "@/data/erc20s"

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

  const publicClient = getPublicClient()

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

  if (zapMarket?.tokenIn === NATIVE_ETH_ADDRESS) {
    estimateGasData.value = zapMarket?.amountIn
  }

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return await waitForTransaction(hash)
}

export const doZapAndLock = async (
  marketAddress: Address,
  walletClient: WalletClient,
  zapMarket: ZapMarketData,
  zapLockData: { routerAddress: string; data: string },
  isPermaLock: boolean
) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = getPublicClient()

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

  if (zapMarket?.tokenIn === NATIVE_ETH_ADDRESS) {
    estimateGasData.value = zapMarket?.amountIn
  }

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return await waitForTransaction(hash)
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
  lockBalanceAllowanceData: { balance: bigint; allowance: bigint },
  depositPositionInfo: LockPosition | undefined,
  depositWeiValue: bigint,
  depositAsset: string,
  isWellConnected: boolean
): Promise<FormState> {
  const errors: FormError[] = []
  const isZapMode = depositAsset !== "TAN"

  const currentBlock = await getCurrentBlock()

  const isApproved =
    (!isZapMode && (depositWeiValue || 0n) <= (lockBalanceAllowanceData?.allowance || 0n)) ||
    (isZapMode && (depositWeiValue || 0n) <= (lockBalanceAllowanceData?.allowance || 0n))

  if (!isWellConnected) {
    errors.push(dappErrors["no-wallet"])
  } else {
    if (!depositWeiValue || depositWeiValue === 0n) {
      errors.push(dappErrors["empty-form"])
    } else if (lockBalanceAllowanceData?.balance < depositWeiValue) {
      errors.push(dappErrors["balance"])
    }
    if (!!depositPositionInfo?.endLockTime && currentBlock.timestamp > Number(depositPositionInfo?.endLockTime)) {
      errors.push(dappErrors["lock-expired"])
    }
  }

  return { canProcess: errors.length === 0, errors, haveToApprove: !isApproved }
}
