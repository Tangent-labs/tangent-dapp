"use client"
import { useMemo } from "react"
import { Button } from "../design_system/inputs/button"
import { useWalletConnexionContext } from "../pages/wallet_connexion_context"
import { formatAddress } from "@/lib/utils"

type WalletConnexionButtonProps = React.HTMLAttributes<HTMLButtonElement>

export const WalletConnexionButton = ({ ...props }: WalletConnexionButtonProps) => {
  const { isConnecting, connect, changeNetwork, isConnected, isChainConnected, currentAccount } = useWalletConnexionContext()

  const buttonLabel = useMemo(() => {
    if (isConnecting) return "..."
    if (!isConnected) return "Connect wallet"
    if (!isChainConnected) return "Change network"
    return formatAddress(currentAccount?.address) || " - "
  }, [isConnected, isChainConnected, currentAccount, isConnecting])

  const handleClick = () => {
    if (!isConnected) return connect()
    if (!isChainConnected) return changeNetwork()
  }

  return <Button label={buttonLabel} className="!p-4 !mb-2 !text-sm" onClick={handleClick} {...props} />
}
