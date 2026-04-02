import { AssetDataPriced } from "@/types"
import WStable from "@/abi/USG/WStable.json"
import IERC4626 from "@/abi/USG/IERC4626.json"
import { BalanceAllowanceData, FormError, FormState } from "../usg_type"
import { getApproveTx, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Abi, Address, EstimateContractGasParameters, SendTransactionParameters, WalletClient, WriteContractParameters } from "viem"

export const doApprove = async (walletClient: WalletClient, depositAssetAddress: Address, amount: bigint, spender: Address) => {
  const publicClient = getPublicClient()

  const txData = getApproveTx(depositAssetAddress, spender, amount)

  const gas = await publicClient.estimateContractGas(txData as EstimateContractGasParameters)
  txData.gas = gas

  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return await waitForTransaction(hash)
}

export const doCustomQuote = async (method: string, depositValue: bigint, address: Address | undefined, tokenAddress: Address) => {
  const publicClient = getPublicClient()

  const txData = {
    abi: IERC4626.abi as Abi,
    functionName: method,
    args: [depositValue],
    address: tokenAddress,
    account: address,
  }

  const previewCustomeQuote = await publicClient.readContract(txData)

  return previewCustomeQuote
}

export const doCustomSwap = async (walletClient: WalletClient, abi: Abi, method: string, amount: bigint, contractAddress: Address, isStaked?: boolean) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = getPublicClient()

  const fnArgs = method === "deposit" || method === "redeem" ? [amount, account] : [amount, account, isStaked]

  const estimateGasData = {
    abi,
    functionName: method,
    args: fnArgs as unknown[],
    address: contractAddress,
    account,
    value: 0n,
  } as EstimateContractGasParameters

  const gas = await publicClient.estimateContractGas(estimateGasData)

  const txData = { ...estimateGasData, gas }

  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return await waitForTransaction(hash)
}

export function getSwapFormState(
  isSwapBlockedByPriceImpact: boolean,
  isSwapBlockedBySlippage: boolean,
  approveNotNeeded: boolean,
  depositWeiValue?: bigint,
  receiveWeiValue?: bigint,
  isWellConnected?: boolean,
  depositAssetInfo?: AssetDataPriced,
  receiveAssetInfo?: AssetDataPriced,
  balanceAllowanceData?: BalanceAllowanceData,
  isLoading?: boolean
): FormState {
  const errors: FormError[] = []

  const isApproved = approveNotNeeded || (depositWeiValue || 0n) <= (balanceAllowanceData?.allowances[0]?.allowance || 0n)

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
    if (!depositAssetInfo || !receiveAssetInfo) return { canProcess: false, errors: [], haveToApprove: false }

    if (!depositWeiValue || depositWeiValue === 0n) return { canProcess: false, errors: [], haveToApprove: false }

    if (depositWeiValue > (balanceAllowanceData?.balance || 0n)) {
      errors.push({
        key: "balance",
        title: "Insufficient Balance",
        subtitle: "You don't have enough tokens to complete this swap.",
        content: "Please reduce your swap amount or acquire more tokens.",
        type: "form-alert",
      })
    }

    if (!!depositWeiValue && !isLoading && (!receiveWeiValue || receiveWeiValue === 0n)) {
      errors.push({
        key: "empty-form",
        title: "Buy token missing",
        subtitle: "The receive token is missing.",
        content: "You need to input a target token.",
        type: "form-alert",
      })
    }

    if (!depositWeiValue || depositWeiValue === 0n) return { canProcess: false, errors: [], haveToApprove: false }

    if (isSwapBlockedBySlippage) {
      errors.push({
        key: "slippage",
        title: "Slippage Too High",
        subtitle: "Your slippage tolerance is blocking this transaction.",
        content: "Please lower your slippage to proceed.",
        type: null,
      })
    }
    if (isSwapBlockedByPriceImpact) {
      errors.push({
        key: "price-impact",
        title: "Price Impact Too High",
        subtitle: "Price Impact Too High",
        content: "Price Impact Too High",
        type: null,
      })
    }
  }

  return {
    canProcess: isApproved && errors.length === 0 && !isLoading,
    errors,
    haveToApprove: !isApproved,
  }
}

export async function doSwap(walletClient: WalletClient, data: SendTransactionParameters) {
  return await walletClient?.sendTransaction(data)
}

export const getABI = (depositSymbol: string, receiveSymbol: string) => {
  if (depositSymbol.includes("sUSG") || receiveSymbol.includes("sUSG")) {
    return IERC4626
  }
  return WStable
}
