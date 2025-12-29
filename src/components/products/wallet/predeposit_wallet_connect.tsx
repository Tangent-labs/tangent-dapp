"use client"

import { useMemo } from "react"
import { formatAddress } from "@/lib/other_formatter"
import { IconCross } from "@/components/icons"
import { Button } from "@/components/design_system/inputs/button"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

export const PredepositWalletConnect = () => {
  const { connect, disconnect, changeNetwork, isConnected, isChainConnected, currentAddress } = useWalletConnexionContext()

  const buttonLabel = useMemo(() => {
    if (!isConnected) return "Connect Wallet"
    if (!isChainConnected) return "Switch Network"
    return formatAddress(currentAddress) || "Unknown Address"
  }, [isConnected, isChainConnected, currentAddress])

  const handleConnect = async () => {
    await connect()
  }

  const handleDisconnect = async () => {
    await disconnect()
  }

  const handleSwitchNetwork = async () => {
    await changeNetwork()
  }

  const handleButtonClick = () => {
    if (!isConnected) {
      handleConnect()
    } else if (!isChainConnected) {
      handleSwitchNetwork()
    } else if (isConnected) {
      handleDisconnect()
    }
  }

  return (
    <>
      {isConnected ? (
        <Button onClick={handleDisconnect} className="flex h-10 items-center justify-center">
          {buttonLabel} {isConnected}
        </Button>
      ) : (
        <Button onClick={handleButtonClick} className="flex h-10 items-center justify-center">
          {buttonLabel} {isConnected && <IconCross className="ml-2 mt-0.5 w-3"></IconCross>}
        </Button>
      )}
    </>
  )
}
