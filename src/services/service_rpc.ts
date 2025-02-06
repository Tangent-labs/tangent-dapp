import { dappConfig } from "@/dapp_config"
import { TxContractCallData } from "@/types"
import {
  Abi,
  Address,
  Chain,
  createPublicClient,
  decodeErrorResult,
  encodeDeployData,
  EncodeFunctionDataParameters,
  EncodeFunctionDataReturnType,
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
  rpcUrls: { default: { http: [dappConfig.chain.rpc], webSocket: [] } },
  name: dappConfig.chain.name,
}

export const getPublicClient = () => {
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  })
  return publicClient
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

  // // Encoded TX
  // return {
  //   encoded: {
  //     to: contract,
  //     data: encodeFunctionData(data),
  //   },
  //   raw: {
  //     ...data,
  //     address: contract,
  //     gas: undefined,
  //   },
  // }
}

export const executeAppove = async (client: WalletClient, contract: Address, spender: Address, amount: bigint) => {
  const txData = getApproveTx(contract, spender, amount)
  return executeContractCall(client, txData as TxContractCallData)
}

export const waitForTransaction = async (hash: Hash) => {
  const publicClient = await getPublicClient()
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  return receipt.status === "success"
}

export const executeTransaction = async (client: WalletClient, txData: { data: EncodeFunctionDataReturnType; to?: Address }) => {
  try {
    const [address] = await client.getAddresses()
    const txHash = await client.request({
      method: "eth_sendTransaction",
      params: [
        {
          ...txData,
          from: address,
        },
      ],
    })
    return txHash
  } catch (e) {
    console.error(e)
    throw e
  }
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
  const publicClient = await getPublicClient()
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

export const executeChainView = async <T>(abi: Abi, byteCode: Hex, args?: unknown[]): Promise<T | undefined> => {
  function isNestedErrorWithData(error: unknown): error is { cause: { cause: { cause: { data: { data: Hex } } } } } {
    return (
      typeof error === "object" &&
      error !== null &&
      "cause" in error &&
      typeof (error as { cause: unknown }).cause === "object" &&
      (error as { cause: { cause: unknown } }).cause.cause !== undefined &&
      typeof (error as { cause: { cause: { cause: unknown } } }).cause.cause.cause === "object" &&
      (error as { cause: { cause: { cause: { data: unknown } } } }).cause.cause.cause.data !== undefined &&
      typeof (error as { cause: { cause: { cause: { data: { data: Hex } } } } }).cause.cause.cause.data.data === "string"
    )
  }

  const txData = getDeployTx(abi, byteCode, args)
  const client = getPublicClient()
  try {
    await client.estimateGas({ data: txData })
  } catch (e: unknown | { cause: { cause: { cause: { data: { data: Hex } } } } }) {
    if (!isNestedErrorWithData(e)) throw e
    const dataRaw = e.cause.cause.cause.data.data
    if (!dataRaw) throw e
    const v = decodeErrorResult({
      abi,
      data: dataRaw,
    })
    return v?.args as T
  }
}

export const gasCostToUSD = async (gasUsed: bigint): Promise<number> => {
  try {
    const gasPriceResponse = await fetch("https://api.etherscan.io/api?module=gastracker&action=gasoracle")
    const gasPriceData = await gasPriceResponse.json()
    const gasPriceInGwei = Number(gasPriceData.result.ProposeGasPrice)

    const ethPriceResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
    const ethPriceData = await ethPriceResponse.json()

    const ethPriceInUSD = ethPriceData.ethereum.usd

    const gasPriceInEth = gasPriceInGwei * 1e-9

    const costInEth = Number(gasUsed) * gasPriceInEth

    const costInUSD = costInEth * ethPriceInUSD

    return parseFloat(costInUSD.toFixed(2))
  } catch (error) {
    console.error("Error fetching gas or ETH price:", error)
    return 0
  }
}
