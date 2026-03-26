"use client"

import { useMemo } from "react"
import { formatAddress } from "@/lib/other_formatter"
import { Button } from "@/components/design_system/inputs/button"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

export const PredepositWalletConnect = () => {
  const { disconnect, requestWalletAction, isConnected, currentAddress } = useWalletConnexionContext()

  const buttonLabel = useMemo(() => {
    if (!isConnected) return "Connect Wallet"
    return formatAddress(currentAddress) || "Unknown Address"
  }, [isConnected, currentAddress])

  const handleDisconnect = async () => {
    await disconnect()
  }

  const handleButtonClick = () => {
    if (!isConnected) {
      requestWalletAction()
    } else if (isConnected) {
      handleDisconnect()
    }
  }

  return (
    <>
      {isConnected ? (
        <Button onClick={handleDisconnect} className="flex h-10 w-40 items-center justify-center">
          {buttonLabel}
        </Button>
      ) : (
        <Button onClick={handleButtonClick} className="flex h-10 w-40 items-center justify-center">
          {buttonLabel}
        </Button>
      )}
    </>
  )
}
