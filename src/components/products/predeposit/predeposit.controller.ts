import { Abi, Address, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"
import { getPublicClient } from "@/services/service_rpc"
import PredepositPoolsABI from "../../../abi/USG/PredepositPoolsABI.json"
import { computedMinAmountOut } from "../usg/record/usg_record_controller"
import { PredepositRawState, PredepositStatus } from "./types/types"

export const getFormState = (
  depositValue: bigint | undefined,
  balanceAllowance: {
    balance: bigint
    allowance: bigint
  }
) => {
  const reasons: string[] = []

  const isApproved = (depositValue || 0n) <= (balanceAllowance?.allowance || 0n)

  if (!depositValue || depositValue === 0n) {
    return { canProcess: false, cantProcessReasons: reasons, haveToApprove: false }
  }

  if (!!depositValue && depositValue > balanceAllowance?.allowance) {
    reasons.push("Allowance too low")
  }

  if (!!depositValue && depositValue > balanceAllowance?.balance) {
    reasons.push("Balance too low")
  }

  return { canProcess: reasons.length === 0, cantProcessReasons: reasons, haveToApprove: !isApproved }
}

export const fetchQuote = async (depositValue: bigint, contract: Address) => {
  const publicClient = getPublicClient()

  const txData = {
    abi: PredepositPoolsABI.abi as Abi,
    functionName: "calc_token_amount",
    args: [[depositValue, 0n], true],
    address: contract,
  }

  const previewCustomeQuote = await publicClient.readContract(txData)

  return previewCustomeQuote as bigint
}

export const deposit = async (walletClient: WalletClient, amount: bigint, slippage: number, contract: Address) => {
  const publicClient = getPublicClient()
  const [account] = await walletClient.requestAddresses()

  const minOut = computedMinAmountOut(amount, slippage)

  const estimateGasData = {
    abi: PredepositPoolsABI.abi as Abi,
    functionName: "add_liquidity",
    args: [[amount, 0n], minOut],
    address: contract,
    account,
  } as EstimateContractGasParameters

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return hash
}

export const mapPredepositStatus = (status: PredepositRawState): PredepositStatus => {
  const predepositStatus = {
    predepositState: status?.predepositState,
    userState: status?.userState,
    isSigned: status?.isSigned,

    USGUSDCData: {
      USGUSDCAccumulatedBalance: BigInt(status?.lpData[0]?.accumulatedBalance),
      USGUSDCAccumulatedTotal: BigInt(status?.lpData[0]?.accumulatedTotal),
      USGUSDCCap: BigInt(status?.lpData[0]?.cap),
      lpName: status?.lpData[0]?.lpName,
      name: status?.lpData[0]?.otherStable?.name,
      address: status?.lpData[0]?.otherStable?.address as Address,
      decimals: status?.lpData[0]?.otherStable?.decimals,
    },

    USGfrxUSDData: {
      USGfrxUSDAccumulatedBalance: BigInt(status?.lpData[1]?.accumulatedBalance),
      USGfrxUSDAccumulatedTotal: BigInt(status?.lpData[1]?.accumulatedTotal),
      USGfrxUSDCap: BigInt(status?.lpData[1]?.cap),
      lpName: status?.lpData[1]?.lpName,
      name: status?.lpData[1]?.otherStable?.name,
      address: status?.lpData[1]?.otherStable?.address as Address,
      decimals: status?.lpData[1]?.otherStable?.decimals,
    },
  }

  return predepositStatus
}
