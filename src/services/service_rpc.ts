import { dappConfig } from "@/dapp_config"
import { WalletState } from "@web3-onboard/core"
import { Address, Chain, createPublicClient, createWalletClient, custom, encodeFunctionData, EncodeFunctionDataReturnType, http, WalletClient } from "viem"

const chain: Chain = {
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

export const getWalletClient = async (onBoardWallet: WalletState): Promise<WalletClient | undefined> => {
  if (!onBoardWallet) return

  const client = createWalletClient({
    chain,
    transport: custom(onBoardWallet.provider),
  })

  return client
}

export const getApproveTx = (contract: Address, spender: Address, amount: bigint): { data: EncodeFunctionDataReturnType; to: Address } => {
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
  const data = encodeFunctionData({
    abi: approveAbi,
    functionName: "approve",
    args: [spender, amount],
  })

  // Encoded TX
  return {
    to: contract,
    data,
  }
}

export const executeTransaction = async (client: WalletClient, txData: { data: EncodeFunctionDataReturnType; to: Address }) => {
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
}
