"use client"

import { useMemo } from "react"
import { formatAddress } from "@/lib/other_formatter"
import { IconCross } from "@/components/icons/icon_cross"
import { Button } from "@/components/design_system/inputs/button"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import TokenImage from "@/components/design_system/structure/token_image"
import { IconTx } from "@/components/icons/icon_tx"
import { IconOpenOutside } from "@/components/icons/icon_open_outside"

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
      <Popover>
        {isConnected ? (
          <PopoverTrigger asChild>
            <Button className="flex h-10 items-center justify-center" disabled={isConnecting} {...props}>
              {buttonLabel} {isConnected && <IconCross className="ml-2 mt-0.5 w-3"></IconCross>}
            </Button>
          </PopoverTrigger>
        ) : (
          <Button onClick={handleConnect} className="flex h-10 items-center justify-center" disabled={isConnecting} {...props}>
            {buttonLabel} {isConnected && <IconCross className="ml-2 mt-0.5 w-3"></IconCross>}
          </Button>
        )}

        <PopoverContent align="end">
          {isConnected && (
            <div data-combobox className="flex min-h-56 w-full min-w-80 flex-col overflow-hidden bg-[#070707] p-2 font-roobert">
              <div className="flex flex-col border-b border-white/10 py-2">
                <span className="font-semibold"> {buttonLabel} </span>
                <span className="text-subtitle"> Connected with Metamask </span>
              </div>

              <div className="my-3 flex w-full items-center justify-between gap-2">
                <div className="flex w-full items-center justify-center gap-1 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]">
                  <TokenImage token="USG" size={24} />

                  <div className="flex flex-col">
                    <span className="text-xs">50,50</span>
                    <span className="text-xs text-subtitle">$50.50</span>
                  </div>
                </div>

                <div className="flex w-full items-center justify-center gap-1 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]">
                  <TokenImage token="sUSG" size={24} />

                  <div className="flex flex-col">
                    <span className="text-xs">50,50</span>
                    <span className="text-xs text-subtitle">$50.50</span>
                  </div>
                </div>
              </div>

              <div className="flex w-full items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex w-full items-center justify-center gap-1 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]">
                  <TokenImage token="TAN" size={24} />

                  <div className="flex flex-col">
                    <span className="text-xs">50,50</span>
                    <span className="text-xs text-subtitle">$50.50</span>
                  </div>
                </div>

                <div className="flex w-full items-center justify-center gap-1 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]">
                  <TokenImage token="sTAN" size={24} />

                  <div className="flex flex-col">
                    <span className="text-xs">50,50</span>
                    <span className="text-xs text-subtitle">$50.50</span>
                  </div>
                </div>

                <div className="flex w-full items-center justify-center gap-1 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]">
                  <TokenImage token="vsTAN" size={24} />

                  <div className="flex flex-col">
                    <span className="text-xs">50,50</span>
                    <span className="text-xs text-subtitle">$50.50</span>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col border-b border-white/10 py-3 text-xs">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center justify-start gap-2 font-semibold text-subtitle">
                    <IconTx className="w-3"></IconTx> Recent Transactions
                  </div>

                  <div className="font-semibold text-white">Clear All</div>
                </div>

                <div className="flex w-full cursor-pointer items-center justify-between hover:text-white">
                  <span className="text-subtitle">Stake 50 TAN for 50 sTAN</span>

                  <IconOpenOutside className="w-3 cursor-pointer hover:fill-white"></IconOpenOutside>
                </div>
              </div>

              <div
                onClick={handleButtonClick}
                className="flex w-full cursor-pointer items-center justify-start bg-danger bg-clip-text p-2 font-bold text-transparent"
              >
                {isConnected ? "Log out" : ""}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </>
  )
}
