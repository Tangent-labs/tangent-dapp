"use client"

import { dappConfig } from "@/dapp_config"
import { TxContractCallData } from "@/types"
import { getSwapAssetPrice } from "./service_price"
import {
  Abi,
  Address,
  Chain,
  createPublicClient,
  decodeErrorResult,
  encodeDeployData,
  EncodeFunctionDataParameters,
  Hash,
  Hex,
  http,
  WalletClient,
  WriteContractParameters,
} from "viem"

export const chain: Chain = {
  id: dappConfig.chain.id,
  nativeCurrency: {
    decimals: 18,
    name: "ETH",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: [dappConfig.chain.rpc], webSocket: [] },
  },
  name: dappConfig.chain.name,
}

const publicClient = createPublicClient({
  chain,
  transport: http(chain.rpcUrls.default.http[0], {
    retryCount: 0,
    timeout: 30_000,
  }),
})

function getRetryClients() {
  return dappConfig.chain.fallbackRpcs.map((url) => {
    return createPublicClient({
      chain,
      transport: http(url, {
        retryCount: 0,
        timeout: 30_000,
      }),
    })
  })
}

// Make getPublicClient great again (singleton version)
export const getPublicClient = () => publicClient

export const getBackupClients = () => getRetryClients()

export const getCurrentBlock = async () => {
  return publicClient.getBlock({ blockTag: "latest" })
}

export type ApproveTxResult = EncodeFunctionDataParameters & { gas: undefined | bigint; address: Address }

export const getApproveTx = (contract: Address, spender: Address, amount: bigint): ApproveTxResult => {
  const approveAbi = [
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ]

  // Prepare approve transaction data
  return {
    abi: approveAbi as unknown as Abi,
    functionName: "approve",
    args: [spender, amount],
    gas: undefined,
    address: contract,
  }
}

export const executeApprove = async (client: WalletClient, contract: Address, spender: Address, amount: bigint) => {
  const txData = getApproveTx(contract, spender, amount)
  return executeContractCall(client, txData as TxContractCallData)
}

export const waitForTransaction = async (hash: Hash) => {
  const publicClient = getPublicClient()
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  return receipt.status === "success"
}

export const getDeployTx = (abi: Abi, byteCode: Hex, args?: unknown[]) => {
  const data = encodeDeployData({
    abi: abi,
    bytecode: byteCode,
    args: args || [],
  })
  return data
}

export const executeContractCall = async (walletClient: WalletClient, txData: TxContractCallData) => {
  const [account] = await walletClient.requestAddresses()
  const publicClient = getPublicClient()
  txData.account = account
  const gas = await publicClient.estimateContractGas(txData)
  txData.gas = gas
  const hash = await walletClient.writeContract(txData as unknown as WriteContractParameters)
  return hash
}

export const executeChainViewUnique = async <T>(abi: Abi, byteCode: Hex, args?: unknown[]): Promise<T | undefined> => {
  const data = await executeChainView<[T]>(abi, byteCode, args)
  return data?.at(0)
}

function extractRevertData(error: unknown): Hex | undefined {
  if (typeof error !== "object" || error === null) return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = error as any
  const candidates: unknown[] = [
    e?.cause?.cause?.cause?.data,
    e?.cause?.cause?.cause?.data?.data,
    e?.cause?.cause?.data?.data,
    e?.cause?.data?.data,
    e?.data?.data,
    e?.cause?.cause?.data,
    e?.cause?.data,
    e?.data,
  ]
  return candidates.find((v): v is Hex => typeof v === "string" && v.startsWith("0x") && v.length > 2)
}

export const executeChainView = async <T>(abi: Abi, byteCode: Hex, args?: unknown[], retryCount: number = 0): Promise<T | undefined> => {
  const maxRetries = getBackupClients().length + 1
  if (retryCount > maxRetries) return undefined

  const txData = getDeployTx(abi, byteCode, args)
  const client = retryCount === 0 ? getPublicClient() : getBackupClients()[retryCount - 1]

  try {
    await client.estimateGas({ data: txData })
  } catch (e: unknown) {
    const dataRaw = extractRevertData(e)
    if (!dataRaw) return executeChainView(abi, byteCode, args, retryCount + 1)

    try {
      const v = decodeErrorResult({ abi, data: dataRaw })
      return v?.args as T
    } catch {
      return executeChainView(abi, byteCode, args, retryCount + 1)
    }
  }
}

export const gasCostToUSD = async (gasUsed: bigint): Promise<number> => {
  try {
    const gasPriceResponse = await fetch("https://api.etherscan.io/api?module=gastracker&action=gasoracle")
    const gasPriceData = await gasPriceResponse.json()
    const gasPriceInGwei = Number(gasPriceData.result.ProposeGasPrice)

    const ethPriceData = await getSwapAssetPrice("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE")

    const gasPriceInEth = gasPriceInGwei * 1e-9

    const costInEth = Number(gasUsed) * gasPriceInEth

    const costInUSD = costInEth * ethPriceData!

    return parseFloat(costInUSD.toFixed(2))
  } catch (error) {
    console.error("Error fetching gas or ETH price:", error)
    return 0
  }
}
