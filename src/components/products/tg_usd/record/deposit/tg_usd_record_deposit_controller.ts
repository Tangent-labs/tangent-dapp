import { AssetDataPriced } from "@/types"
import MarketExternalActions from "@/abi/tgusd/MarketExternalActions.json"
import { TGUSD_CONTRACT } from "../../tg_usd_repository"
import { getBorrowCommonFormState } from "../tg_usd_record_controller"
import GetBalances from "@/abi/tgusd/GetBalances.json"
import { Abi, Address, EstimateContractGasParameters, Hex, WalletClient, WriteContractParameters } from "viem"
import { BalanceAllowanceData, MarketDetailData, TgUsdtMarketDepositParams, ZapMarketData } from "../../tg_usd_type"
import { executeAppove, executeChainViewUnique, executeContractCall, getApproveTx, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { getRouteTxData } from "./deposit_actions"

export const getBalances = async (user: Address, tokens: Address[]) => {
  return await executeChainViewUnique<bigint[]>(GetBalances.abi as Abi, GetBalances.bytecode as Hex, [user, tokens])
}

export function getDepositFormState(
  marketData?: MarketDetailData,
  depositWeiValue?: bigint,
  borrowWeiValue?: bigint,
  isDepositAndBorrow?: boolean,
  isWellConnected?: boolean,
  depositAssetInfo?: AssetDataPriced,
  collateralInfo?: AssetDataPriced,
  balanceAllowanceData?: BalanceAllowanceData,
  isDepositLoading?: boolean
) {
  const isZapMode = !!depositAssetInfo && !!balanceAllowanceData && depositAssetInfo?.address !== collateralInfo?.address

  const reasons: string[] = []
  const isApproved =
    (!depositAssetInfo && (depositWeiValue || 0n) <= (marketData?.collateralAllowance || 0n)) ||
    (isZapMode && (depositWeiValue || 0n) <= (balanceAllowanceData?.allowances[0]?.allowance || 0n))

  if (isDepositLoading) {
    reasons.push("Action in progress.")
  }
  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    if (depositWeiValue === 0n) {
      reasons.push("No amount.")
    } else if (!isZapMode && (depositWeiValue || 0n) > (marketData?.collateralBalance || 0n)) {
      reasons.push("Not enough balance.")
    } else if (isZapMode && (depositWeiValue || 0n) > (balanceAllowanceData?.balance || 0n)) {
      reasons.push("Not enough balance.")
    }

    if (isDepositAndBorrow) {
      const borrowReasons = getBorrowCommonFormState(marketData, depositWeiValue, borrowWeiValue)
      reasons.push(...borrowReasons)
    }
  }

  return {
    canProcess: isApproved && reasons.length === 0,
    cantProcessReasons: reasons,
    haveToApprove: !isApproved,
  }
}

export async function doMarketDeposit(walletClient: WalletClient, args: TgUsdtMarketDepositParams) {
  if (!args.isDepositAndBorrow) {
    const [account] = await walletClient.requestAddresses()
    const txData = {
      abi: MarketExternalActions.abi as Abi,
      functionName: "deposit",
      address: args.marketAddress,
      args: [account, args.depositWeiValue, args.isStaking],
    }
    const txHash = await executeContractCall(walletClient, txData)
    return await waitForTransaction(txHash)
  } else {
    const txData = {
      abi: MarketExternalActions.abi as Abi,
      functionName: "depositAndBorrow",
      address: args.marketAddress,
      args: [args.depositWeiValue, args.borrowWeiValue, args.isStaking],
    }
    const txHash = await executeContractCall(walletClient, txData)
    return await waitForTransaction(txHash)
  }
}

export async function doApproveMarketDeposit(walletClient: WalletClient, collateralAddress: Address, args: TgUsdtMarketDepositParams) {
  const txHash = await executeAppove(walletClient, collateralAddress, args.marketAddress, args.depositWeiValue)
  return await waitForTransaction(txHash)
}

export const doApproveZap = async (walletClient: WalletClient, assetAddress: Address, amount: bigint, marketAddress: Address) => {
  const publicClient = await getPublicClient()

  const txData = getApproveTx(assetAddress, marketAddress, amount)

  const gas = await publicClient.estimateContractGas(txData as EstimateContractGasParameters)
  txData.gas = gas

  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return await waitForTransaction(hash)
}

export const doZapDeposit = async (
  marketAddress: Address,
  walletClient: WalletClient,
  router: string,
  routerCall: string,
  zapMarket: ZapMarketData,
  borrowWeiValue?: bigint,
  isStaking?: boolean
) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = await getPublicClient()

  let estimateGasData

  if (borrowWeiValue) {
    estimateGasData = {
      abi: MarketExternalActions.abi,
      functionName: "zapDepositAndBorrow",
      args: [
        borrowWeiValue,
        isStaking,
        {
          tokenIn: zapMarket?.tokenIn,
          amountIn: zapMarket?.amountIn,
          minAmountOut: zapMarket?.minAmountOut,
          zap: { router, routerCall },
        },
      ] as unknown[],
      address: marketAddress,
      account,
      value: 0n,
    } as EstimateContractGasParameters
  } else {
    estimateGasData = {
      abi: MarketExternalActions.abi,
      functionName: "zapDeposit",
      args: [
        account,
        isStaking,
        {
          tokenIn: zapMarket?.tokenIn,
          amountIn: zapMarket?.amountIn,
          minAmountOut: zapMarket?.minAmountOut,
          zap: { router, routerCall },
        },
      ] as unknown[],
      address: marketAddress,
      account,
      value: 0n,
    } as EstimateContractGasParameters
  }

  if (zapMarket?.tokenIn === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    estimateGasData.value = zapMarket?.amountIn
  }

  const gas = await publicClient.estimateContractGas(estimateGasData)
  const txData = { ...estimateGasData, gas }
  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return hash
}

export const prepareZapTransaction = async (
  depositWeiValue: bigint,
  collateralInfo: AssetDataPriced,
  depositAssetInfo: AssetDataPriced,
  marketInfo: { marketAddress: Address },
  slippage: number
) => {
  const routerCall = await getRouteTxData(depositWeiValue, collateralInfo, depositAssetInfo, TGUSD_CONTRACT.ZAPPER, marketInfo.marketAddress, slippage * 100)

  if (!routerCall?.tx?.data) throw new Error("Failed to fetch routing data")

  const zapMarketData = {
    tokenIn: depositAssetInfo?.address,
    amountIn: depositWeiValue,
    minAmountOut: 0n,
  }

  return { routerCallData: routerCall, zapMarketData }
}
