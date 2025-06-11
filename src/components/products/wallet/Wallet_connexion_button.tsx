"use client"

import { useMemo } from "react"
import { formatAddress } from "@/lib/other_formatter"
import { Button } from "@/components/design_system/inputs/button"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

type WalletConnexionButtonProps = React.HTMLAttributes<HTMLButtonElement>

export const WalletConnexionButton = ({ ...props }: WalletConnexionButtonProps) => {
  const { isConnecting, connect, disconnect, changeNetwork, isConnected, isChainConnected, currentAccount } = useWalletConnexionContext()

  const buttonLabel = useMemo(() => {
    if (isConnecting) return "..."
    if (!isConnected) return "Connect Wallet"
    if (!isChainConnected) return "Switch Network"
    return formatAddress(currentAccount?.address) || "Unknown Address"
  }, [isConnected, isChainConnected, currentAccount, isConnecting])

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

  return <Button label={buttonLabel} className="h-10" onClick={() => handleButtonClick()} disabled={isConnecting} {...props} />
}
