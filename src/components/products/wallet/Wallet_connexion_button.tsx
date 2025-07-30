"use client"

import { useMemo } from "react"
import { formatAddress } from "@/lib/other_formatter"
import { Button } from "@/components/design_system/inputs/button"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { IconCross } from "@/components/icons/icon_cross"
import { IconWallet } from "@/components/icons/icon_wallet"

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

  return (
    <>
      <Button className="flex h-8 items-center justify-center xl:hidden" onClick={() => handleButtonClick()} disabled={isConnecting} {...props}>
        {isConnected && <IconWallet className="w-3"></IconWallet>}
      </Button>

      <Button className="hidden h-10 items-center justify-center xl:flex" onClick={() => handleButtonClick()} disabled={isConnecting} {...props}>
        {buttonLabel} {isConnected && <IconCross className="ml-2 mt-0.5 w-3"></IconCross>}
      </Button>
    </>
  )
}
