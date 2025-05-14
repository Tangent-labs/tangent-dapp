import { getApproveTx, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Abi, Address, EstimateContractGasParameters, SendTransactionParameters, WalletClient, WriteContractParameters } from "viem"
import IERC4626 from "@/abi/tgusd/IERC4626.json"
import WStable from "@/abi/tgusd/WStable.json"
import { BalanceAllowanceData, SwapToken } from "../tg_usd_type"
import { getSwapAssetPrice } from "@/services/service_price"
import { AssetDataPriced } from "@/types"
import { getEnsoData } from "../api"

export const computeSwapAssetPrice = async (tokens: SwapToken[], depositAsset: string) => {
  try {
    const tokenAddress = tokens.find((el: SwapToken) => el.name === depositAsset || el.symbol === depositAsset)
      ? tokens.find((el: SwapToken) => el.name === depositAsset || el.symbol === depositAsset)?.address
      : undefined
    if (tokenAddress) {
      const data = await getSwapAssetPrice(tokenAddress)
      return data
    } else return null
  } catch (error) {
    console.error("Failed to compute swap asset price:", error)
    return null
  }
}

export const doApprove = async (walletClient: WalletClient, depositAssetAddress: Address, amount: bigint, spender: Address) => {
  const publicClient = await getPublicClient()

  const txData = getApproveTx(depositAssetAddress, spender, amount)

  const gas = await publicClient.estimateContractGas(txData as EstimateContractGasParameters)
  txData.gas = gas

  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return await waitForTransaction(hash)
}

export const doCustomQuote = async (method: string, depositValue: bigint, address: Address | undefined, tokenAddress: Address) => {
  const publicClient = await getPublicClient()

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

  const publicClient = await getPublicClient()

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
  return hash
}

export function getSwapFormState(
  approveNotNeeded: boolean,
  depositWeiValue?: bigint,
  receiveWeiValue?: bigint,
  isWellConnected?: boolean,
  depositAssetInfo?: AssetDataPriced,
  receiveAssetInfo?: AssetDataPriced,
  balanceAllowanceData?: BalanceAllowanceData
) {
  if (!depositAssetInfo || !receiveAssetInfo)
    return {
      canProcess: false,
      cantProcessReasons: [],
      haveToApprove: true,
    }

  const reasons: string[] = []

  const isApproved = approveNotNeeded || ((depositWeiValue || 0n) <= (balanceAllowanceData?.allowances[0]?.allowance || 0n) && !approveNotNeeded)

  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    if (!depositWeiValue || depositWeiValue === 0n) {
      reasons.push("No amount.")
    } else if ((depositWeiValue || 0n) > (balanceAllowanceData?.balance || 0n)) {
      reasons.push("Not enough balance.")
    } else if (!receiveWeiValue || receiveWeiValue === 0n) {
      reasons.push("You need to input a target token.")
    }
  }

  return {
    canProcess: isApproved && reasons.length === 0,
    cantProcessReasons: reasons,
    haveToApprove: !isApproved,
  }
}

export async function doSwap(walletClient: WalletClient, data: SendTransactionParameters) {
  return await walletClient?.sendTransaction(data)
}

export const fetchEnsoData = async (
  depositWeiValue: bigint,
  receiver: Address,
  receiveAssetInfo: AssetDataPriced,
  depositAssetInfo: AssetDataPriced,
  minAmountOut: bigint
) => {
  const routerCall = await getEnsoData(depositWeiValue, depositAssetInfo?.address, receiveAssetInfo?.address, null, receiver, minAmountOut)

  if (!routerCall) throw new Error("Failed to fetch routing data")

  return { routerCallData: routerCall?.tx }
}

export const getABI = (depositSymbol: string, receiveSymbol: string) => {
  if (depositSymbol.includes("sgUSD") || receiveSymbol.includes("sgUSD")) {
    return IERC4626
  }
  return WStable
}
