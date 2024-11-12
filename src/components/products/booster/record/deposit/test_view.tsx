"use client"

import React, { useEffect, useState } from "react"

import { http, type Address, type Hash, type TransactionReceipt, createPublicClient, createWalletClient, custom, stringify } from "viem"
import "viem/window"
// import { wagmiContract } from "./test_contract"
import { chain } from "@/services/service_rpc"

export function Example() {
  const walletClient =
    window?.ethereum &&
    createWalletClient({
      chain,
      transport: custom(window.ethereum),
    })

  const publicClient = createPublicClient({
    chain,
    transport: http(),
  })

  const [account, setAccount] = useState<Address>()
  const [hash, setHash] = useState<Hash>()
  const [receipt, setReceipt] = useState<TransactionReceipt>()

  const connect = async () => {
    const [address] = await walletClient!.requestAddresses()
    setAccount(address)
  }

  const mint = async () => {
    // if (!account || !walletClient) return

    // const txData = {
    //   ...wagmiContract,
    //   functionName: "mint",
    //   account,
    // }
    // const gas = await publicClient.estimateContractGas(txData )
    // const { request } = await publicClient.simulateContract({ ...txData, gas })
    // const hash = await walletClient.writeContract(request)
    setHash(hash)
  }

  useEffect(() => {
    ;(async () => {
      if (hash) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        setReceipt(receipt)
      }
    })()
  }, [hash])

  if (account)
    return (
      <>
        <div>Connected: {account}</div>
        <button onClick={mint}>Mint</button>
        {receipt && (
          <div>
            Receipt:{" "}
            <pre>
              <code>{stringify(receipt, null, 2)}</code>
            </pre>
          </div>
        )}
      </>
    )
  return <button onClick={connect}>Connect Wallet</button>
}
