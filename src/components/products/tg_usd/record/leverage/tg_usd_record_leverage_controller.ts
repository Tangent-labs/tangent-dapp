import { AssetDataPriced } from "@/types"
import MarketExternalActions from "@/abi/tgusd/MarketExternalActions.json"
import { TGUSD_CONTRACT } from "../../tg_usd_repository"
import { getBorrowCommonFormState } from "../tg_usd_record_controller"
import GetBalances from "@/abi/tgusd/GetBalances.json"
import { Abi, Address, EstimateContractGasParameters, Hex, WalletClient, WriteContractParameters } from "viem"
import { BalanceAllowanceData, MarketDetailData } from "../../tg_usd_type"
import { executeAppove, executeChainViewUnique, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { getRouteTxData } from "./leverage_actions"

export const getBalances = async (user: Address, tokens: Address[]) => {
  return await executeChainViewUnique<bigint[]>(GetBalances.abi as Abi, GetBalances.bytecode as Hex, [user, tokens])
}

export function getLeverageFormState(
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
    if (borrowWeiValue === 0n) {
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

export async function doApproveMarketDeposit(
  walletClient: WalletClient,
  collateralAddress: Address,
  args: { marketAddress: Address; depositWeiValue: bigint }
) {
  const txHash = await executeAppove(walletClient, collateralAddress, args.marketAddress, args.depositWeiValue)
  return await waitForTransaction(txHash)
}

export const doMarketLeverage = async (
  marketAddress: Address,
  walletClient: WalletClient,
  collatToDeposit: bigint,
  tgUSDToFlashMint: bigint,
  minCollatAmountOut: bigint,
  isStaked: boolean,
  leverageData: { routerAddress: string; data: string }
) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = await getPublicClient()

  const estimateGasData = {
    abi: MarketExternalActions.abi,
    functionName: "leverage",
    args: [
      collatToDeposit,
      tgUSDToFlashMint,
      minCollatAmountOut,
      isStaked,
      { router: leverageData?.routerAddress, routerCall: leverageData?.data },
    ] as unknown[],
    address: marketAddress,
    account,
  } as EstimateContractGasParameters

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
