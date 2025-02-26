import { executeChainViewUnique, getApproveTx, getPublicClient, waitForTransaction } from "@/services/service_rpc"
import { Abi, Address, EstimateContractGasParameters, Hex, SendTransactionParameters, WalletClient, WriteContractParameters, zeroAddress } from "viem"
import GetBalances from "@/abi/tgusd/GetBalances.json"
import GetBalancesAllowances from "@/abi/tgusd/GetBalancesAllowances.json"
import IERC4626 from "@/abi/tgusd/IERC4626.json"
import { BalanceAllowanceData, ZapToken } from "../tg_usd_type"
import { getSwapAssetPrice } from "@/services/service_price"
import { AssetDataPriced } from "@/types"
import { getRouteTxData } from "./buy_actions"

export const getBalances = async (user: Address, tokens: Address[]) => {
  return await executeChainViewUnique<bigint[]>(GetBalances.abi as Abi, GetBalances.bytecode as Hex, [user, tokens])
}

export const getZapTokenBalanceAllowance = async (walletClient: WalletClient, address: Address | undefined, spender: Address | undefined) => {
  address = address || zeroAddress
  const [account] = await walletClient.requestAddresses()

  return await executeChainViewUnique<BalanceAllowanceData[]>(GetBalancesAllowances.abi as Abi, GetBalancesAllowances.bytecode as Hex, [
    account,
    [{ token: address, spenders: [spender] }],
  ])
}

export const computeSwapAssetPrice = async (tokens: ZapToken[], depositAsset: string) => {
  try {
    const tokenAddress = tokens.find((el: ZapToken) => el.name === depositAsset) ? tokens.find((el: ZapToken) => el.name === depositAsset)?.address : undefined
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

export const doCustomSwap = async (walletClient: WalletClient, abi: Abi, method: string, amount: bigint, contractAddress: Address) => {
  const [account] = await walletClient.requestAddresses()

  const publicClient = await getPublicClient()

  const estimateGasData = {
    abi,
    functionName: method,

    args: [amount, account] as unknown[],
    address: contractAddress,
    account,
    value: 0n,
  } as EstimateContractGasParameters

  const gas = await publicClient.estimateContractGas(estimateGasData)

  const txData = { ...estimateGasData, gas }

  const hash = await walletClient.writeContract(txData as WriteContractParameters)
  return hash
}

export function getBuyFormState(
  depositWeiValue?: bigint,
  receiveWeiValue?: bigint,
  isWellConnected?: boolean,
  depositAssetInfo?: AssetDataPriced,
  receiveAssetInfo?: AssetDataPriced,
  balanceAllowanceData?: BalanceAllowanceData
) {
  const reasons: string[] = []
  const isApproved = !!depositAssetInfo && (depositWeiValue || 0n) <= (balanceAllowanceData?.allowances[0]?.allowance || 0n)

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

export async function doSwap(walletClient: WalletClient, routerCall: SendTransactionParameters) {
  const tx = await walletClient?.sendTransaction(routerCall)

  return tx
}

export const fetchEnsoData = async (
  depositWeiValue: bigint,
  receiver: Address,
  receiveAssetInfo: AssetDataPriced,
  depositAssetInfo: AssetDataPriced,
  slippage: number
) => {
  const routerCall = await getRouteTxData(depositWeiValue, receiver, receiveAssetInfo, depositAssetInfo, slippage * 100)

  if (!routerCall) throw new Error("Failed to fetch routing data")

  return { routerCallData: routerCall?.tx }
}

//
//

const tokenRoutingTable = new Map([
  ["crvUSD-wcrvUSD", "1:1"],
  ["wcrvUSD-crvUSD", "1:1"],
  ["frxUSD-wfrxUSD", "1:1"],
  ["wfrxUSD-frxUSD", "1:1"],
  ["USDe-wUSDe", "1:1"],
  ["wUSDe-USDe", "1:1"],
  ["DOLA-wDOLA", "1:1"],
  ["wDOLA-DOLA", "1:1"],
  ["USR-wUSR", "1:1"],
  ["wUSR-USR", "1:1"],
  ["sfrxUSD-wfrxUSD", "custom"],
  ["wfrxUSD-sfrxUSD", "custom"],
  ["sUSDe-wUSDe", "custom"],
  ["wUSDe-sUSDe", "custom"],
  ["scrvUSD-wcrvUSD", "custom"],
  ["wcrvUSD-scrvUSD", "custom"],
  ["sDOLA-wDOLA", "custom"],
  ["wDOLA-sDOLA", "custom"],
  ["wstUSR-wUSR", "custom"],
  ["wUSR-wstUSR", "custom"],
  ["sgUSD-tgUSD", "custom"],
  ["tgUSD-sgUSD", "custom"],
])

export const getQuoteType = (depositSymbol: string, receiveSymbol: string) => {
  const pairKey = `${depositSymbol}-${receiveSymbol}`
  const quote = tokenRoutingTable.get(pairKey)

  if (quote === "1:1") return "1"
  if (quote === "custom") return "custom"
  return "enso"
}

const tokenQuoteFunctions = new Map([
  ["tgUSD-sgUSD", "convertToShares"],
  ["sgUSD-tgUSD", "convertToAssets"],
  ["sDAI-DAI", "convertToAssets"],
  ["DAI-sDAI", "convertToShares"],
  ["sUSDe-USDe", "convertToAssets"],
  ["USDe-sUSDe", "convertToShares"],
  ["sfrxUSD-frxUSD", "convertToAssets"],
  ["frxUSD-sfrxUSD", "convertToShares"],
  ["sfrxUSD-wfrxUSD", "convertToAssets"],
  ["wfrxUSD-sfrxUSD", "convertToShares"],
  ["scrvUSD-wcrvUSD", "convertToAssets"],
  ["wcrvUSD-scrvUSD", "convertToShares"],
  ["sDOLA-wDOLA", "convertToAssets"],
  ["wDOLA-sDOLA", "convertToShares"],
  ["wstUSR-wUSR", "convertToAssets"],
  ["wUSR-wstUSR", "convertToShares"],
])

export const getQuoteFunction = (depositSymbol: string, receiveSymbol: string) => {
  return tokenQuoteFunctions.get(`${depositSymbol}-${receiveSymbol}`) || undefined
}

const tokenApprovalTable = new Map([
  ["tgUSD-sgUSD", "approve"],
  ["sgUSD-tgUSD", null],
  ["frxUSD-wfrxUSD", "approve"],
  ["sfrxUSD-wfrxUSD", "approve"],
  ["wfrxUSD-frxUSD", null],
  ["wfrxUSD-sfrxUSD", null],
  ["crvUSD-wcrvUSD", "approve"],
  ["scrvUSD-wcrvUSD", "approve"],
  ["wcrvUSD-crvUSD", null],
  ["wcrvUSD-scrvUSD", null],
  ["USDe-wUSDe", "approve"],
  ["sUSDe-wUSDe", "approve"],
  ["wUSDe-USDe", null],
  ["wUSDe-sUSDe", null],
  ["DOLA-wDOLA", "approve"],
  ["sDOLA-wDOLA", "approve"],
  ["wDOLA-DOLA", null],
  ["wDOLA-sDOLA", null],
  ["USR-wUSR", "approve"],
  ["wstUSR-wUSR", "approve"],
  ["wUSR-USR", null],
  ["wUSR-wstUSR", null],
])

export const getApprovalType = (depositSymbol: string, receiveSymbol: string) => {
  const pairKey = `${depositSymbol}-${receiveSymbol}`
  return tokenApprovalTable.get(pairKey) || "approve"
}

const tokenSwapTable = new Map([
  ["tgUSD-sgUSD", "deposit"],
  ["sgUSD-tgUSD", "redeem"],
  ["frxUSD-wfrxUSD", "mint"],
  ["sfrxUSD-wfrxUSD", "mint"],
  ["wfrxUSD-frxUSD", "burn"],
  ["wfrxUSD-sfrxUSD", "burn"],
  ["crvUSD-wcrvUSD", "mint"],
  ["scrvUSD-wcrvUSD", "mint"],
  ["wcrvUSD-crvUSD", "burn"],
  ["wcrvUSD-scrvUSD", "burn"],
  ["USDe-wUSDe", "mint"],
  ["sUSDe-wUSDe", "mint"],
  ["wUSDe-USDe", "burn"],
  ["wUSDe-sUSDe", "burn"],
  ["DOLA-wDOLA", "mint"],
  ["sDOLA-wDOLA", "mint"],
  ["wDOLA-DOLA", "burn"],
  ["wDOLA-sDOLA", "burn"],
  ["USR-wUSR", "mint"],
  ["wstUSR-wUSR", "mint"],
  ["wUSR-USR", "burn"],
  ["wUSR-wstUSR", "burn"],
])

export const getSwapFunctionName = (depositSymbol: string, receiveSymbol: string) => {
  const pairKey = `${depositSymbol}-${receiveSymbol}`
  return tokenSwapTable.get(pairKey) || null // Returns null if not found
}

// To update !
const swapContract = new Map([
  ["tgUSD-sgUSD", IERC4626],
  ["sgUSD-tgUSD", IERC4626],
  ["frxUSD-wfrxUSD", IERC4626],
  ["sfrxUSD-wfrxUSD", IERC4626],
  ["wfrxUSD-frxUSD", IERC4626],
  ["wfrxUSD-sfrxUSD", IERC4626],
  ["crvUSD-wcrvUSD", IERC4626],
  ["scrvUSD-wcrvUSD", IERC4626],
  ["wcrvUSD-crvUSD", IERC4626],
  ["wcrvUSD-scrvUSD", IERC4626],
  ["USDe-wUSDe", IERC4626],
  ["sUSDe-wUSDe", IERC4626],
  ["wUSDe-USDe", IERC4626],
  ["wUSDe-sUSDe", IERC4626],
  ["DOLA-wDOLA", IERC4626],
  ["sDOLA-wDOLA", IERC4626],
  ["wDOLA-DOLA", IERC4626],
  ["wDOLA-sDOLA", IERC4626],
  ["USR-wUSR", IERC4626],
  ["wstUSR-wUSR", IERC4626],
  ["wUSR-USR", IERC4626],
  ["wUSR-wstUSR", IERC4626],
])

export const getContractToCall = (depositSymbol: string, receiveSymbol: string) => {
  const pairKey = `${depositSymbol}-${receiveSymbol}`
  return swapContract.get(pairKey) || null
}
