import { Abi, Address, WalletClient, zeroAddress } from "viem"
import { MarketDetailData, TgUsdtMarketDepositParams } from "../../tg_usd_type"
import MarketExternalActions from "@/abi/tgusd/MarketExternalActions.json"
import { executeAppove, executeContractCall, waitForTransaction } from "@/services/service_rpc"
import { getBorrowCommonFormState } from "../tg_usd_record_controller"

export function getDepositFormState(
  marketData?: MarketDetailData,
  depositWeiValue?: bigint,
  borrowWeiValue?: bigint,
  isDepositAndBorrow?: boolean,
  isWellConnected?: boolean
) {
  const reasons: string[] = []
  const isApproved = (depositWeiValue || 0n) <= (marketData?.collateralAllowance || 0n)

  // check the wallet
  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    if (depositWeiValue === 0n) {
      reasons.push("No amount.")
    } else if ((depositWeiValue || 0n) > (marketData?.collateralBalance || 0n)) {
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
      gas: undefined as undefined | bigint,
    }
    const txHash = await executeContractCall(walletClient, txData)
    return await waitForTransaction(txHash)
  } else {
    const txData = {
      abi: MarketExternalActions.abi as Abi,
      functionName: "depositAndBorrow",
      address: args.marketAddress,
      args: [args.depositWeiValue, args.borrowWeiValue, args.isStaking, zeroAddress],
      gas: undefined as undefined | bigint,
    }
    return await executeContractCall(walletClient, txData)
  }
}

export async function doApproveMarketDeposit(walletClient: WalletClient, collateralAddress: Address, args: TgUsdtMarketDepositParams) {
  const txHash = await executeAppove(walletClient, collateralAddress, args.marketAddress, args.depositWeiValue)
  return await waitForTransaction(txHash)
}
