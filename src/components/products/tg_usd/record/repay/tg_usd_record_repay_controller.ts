import { Abi, Address, EstimateContractGasParameters, WalletClient, WriteContractParameters } from "viem"
import { BalanceAllowanceData, MarketDetailData, TgUsdtMarketRepayParams, ZapMarketData } from "../../tg_usd_type"
import MarketExternalActions from "@/abi/tgusd/MarketExternalActions.json"
import { executeContractCall, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { formatBigInt } from "@/lib/number_formatter"

export function getRepayFormState(
  marketData?: MarketDetailData,
  repayWeiValue?: bigint,
  isWellConnected?: boolean,
  balanceAllowanceData?: BalanceAllowanceData,
  repayAsset?: string
) {
  const isZapMode = !!repayAsset && !!balanceAllowanceData && repayAsset !== "tgUSD"

  const isApproved = repayAsset === "tgUSD" || (isZapMode && (repayWeiValue || 0n) <= (balanceAllowanceData?.allowances[0]?.allowance || 0n))

  const reasons: string[] = []
  if (!marketData) return { canProcess: false, cantProcessReasons: [], haveToApprove: false }

  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    if (repayWeiValue === 0n || !repayWeiValue) {
      reasons.push("Amount must be greater than zero.")
    }

    if (reasons.length === 0) {
      const existingDebt = marketData.debtInfos?.userDebt || 0n
      const minimumLoan = marketData.constants?.minimumLoan || 0n
      if (repayWeiValue && repayWeiValue > existingDebt) {
        reasons.push(`Repayment exceeds outstanding debt.`)
      } else if (existingDebt - repayWeiValue! > 0n && existingDebt - repayWeiValue! < minimumLoan) {
        reasons.push(`Remaining debt must be at least ${formatBigInt(minimumLoan, 18, 2)}`)
      }
    }
  }
  return {
    canProcess: isApproved && reasons.length === 0,
    cantProcessReasons: reasons,
    haveToApprove: !isApproved,
  }
}

export async function doRepay(walletClient: WalletClient, args: TgUsdtMarketRepayParams) {
  const [account] = await walletClient.requestAddresses()

  const txData = {
    abi: MarketExternalActions.abi as Abi,
    functionName: "repay",
    address: args.marketAddress,
    args: [account, args.repayWeiValue],
    gas: undefined as undefined | bigint,
  }
  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export async function doRepayAndWithdraw(walletClient: WalletClient, args: TgUsdtMarketRepayParams) {
  const txData = {
    abi: MarketExternalActions.abi as Abi,
    functionName: "repayAndWithdraw",
    address: args.marketAddress,
    args: [args.withdrawWeiValue, args.repayWeiValue],
    gas: undefined as undefined | bigint,
  }
  const txHash = await executeContractCall(walletClient, txData)
  return await waitForTransaction(txHash)
}

export const doZapRepayAndWithdraw = async (
  marketAddress: Address,
  walletClient: WalletClient,
  repayData: { routerAddress: string; data: string },
  zapMarket: ZapMarketData,
  withdrawWeiValue: bigint
) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = await getPublicClient()

  const estimateGasData = {
    abi: MarketExternalActions.abi,
    functionName: "zapRepayAndWithdraw",
    args: [
      withdrawWeiValue,
      {
        tokenIn: zapMarket?.tokenIn,
        amountIn: zapMarket?.amountIn,
        minAmountOut: zapMarket?.minAmountOut,
        zap: { router: repayData?.routerAddress, routerCall: repayData?.data },
      },
    ] as unknown[],
    address: marketAddress,
    account,
    value: 0n,
  } as EstimateContractGasParameters

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return hash
}

export const doZapRepay = async (
  marketAddress: Address,
  walletClient: WalletClient,
  repayData: { routerAddress: string; data: string },
  zapMarket: ZapMarketData
) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = await getPublicClient()

  const estimateGasData = {
    abi: MarketExternalActions.abi,
    functionName: "zapRepay",
    args: [
      account,
      {
        tokenIn: zapMarket?.tokenIn,
        amountIn: zapMarket?.amountIn,
        minAmountOut: zapMarket?.minAmountOut,
        zap: { router: repayData?.routerAddress, routerCall: repayData?.data },
      },
    ] as unknown[],
    address: marketAddress,
    account,
    value: 0n,
  } as EstimateContractGasParameters

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return hash
}
