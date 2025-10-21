"use client"

import { useMemo } from "react"
import { formatAddress } from "@/lib/other_formatter"
import { formatBigInt } from "@/lib/number_formatter"
import { useUSGContext } from "../tg_usd/tg_usd_context"
import { IconCross } from "@/components/icons/icon_cross"
import { IconVsTan } from "@/components/icons/icon_vstan"
import { Button } from "@/components/design_system/inputs/button"
import TokenImage from "@/components/design_system/structure/token_image"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

export const WalletConnexionContent = () => {
  const { connect, disconnect, changeNetwork, tokenInfo, isConnected, isChainConnected, currentAddress } = useWalletConnexionContext()

  const { USGsUSGMetrics, TANsTANMetrics } = useUSGContext()

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
      <Popover>
        {isConnected ? (
          <PopoverTrigger asChild>
            <Button className="flex h-10 items-center justify-center">
              {buttonLabel} {isConnected && <IconCross className="ml-2 mt-0.5 w-3"></IconCross>}
            </Button>
          </PopoverTrigger>
        ) : (
          <Button onClick={handleConnect} className="flex h-10 items-center justify-center">
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
                    <span className="text-xs"> {formatBigInt(USGsUSGMetrics?.USGBalance, 18, 2)} </span>
                    <span className="text-xs text-subtitle">
                      ${formatBigInt(((USGsUSGMetrics?.USGBalance || 0n) * (USGsUSGMetrics?.USGPrice || 0n)) / BigInt(10 ** 18), 18, 2)}
                    </span>
                  </div>
                </div>

                <div className="flex w-full items-center justify-center gap-1 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]">
                  <TokenImage token="sUSG" size={24} />

                  <div className="flex flex-col">
                    <span className="text-xs"> {formatBigInt(USGsUSGMetrics?.sUSGBalance, 18, 2)} </span>
                    <span className="text-xs text-subtitle">
                      ${formatBigInt(((USGsUSGMetrics?.sUSGBalance || 0n) * (USGsUSGMetrics?.sUSGPrice || 0n)) / BigInt(10 ** 18), 18, 2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex w-full items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex w-full items-center justify-center gap-1 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]">
                  <TokenImage token="TAN" size={24} />

                  <div className="flex flex-col">
                    <span className="text-xs"> {formatBigInt(TANsTANMetrics?.tanBalance, 18, 2)} </span>
                    <span className="text-xs text-subtitle">
                      ${formatBigInt(((TANsTANMetrics?.tanBalance || 0n) * (TANsTANMetrics?.tanPrice || 0n)) / BigInt(10 ** 18), 18, 2)}
                    </span>
                  </div>
                </div>

                <div className="flex w-full items-center justify-center gap-1 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]">
                  <TokenImage token="sTAN" size={24} />

                  <div className="flex flex-col">
                    <span className="text-xs"> {formatBigInt(TANsTANMetrics?.sTanBalance, 18, 2)} </span>
                    <span className="text-xs text-subtitle">
                      ${formatBigInt(((TANsTANMetrics?.sTanBalance || 0n) * (TANsTANMetrics?.sTanPrice || 0n)) / BigInt(10 ** 18), 18, 2)}
                    </span>
                  </div>
                </div>

                <div className="flex w-full items-center justify-center gap-1 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]">
                  <IconVsTan className="w-5"></IconVsTan>

                  <div className="flex flex-col">
                    <span className="text-xs"> {formatBigInt(tokenInfo("vsTAN")?.balance, 18, 2)} </span>
                    <span className="text-xs text-subtitle">-</span>
                  </div>
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
