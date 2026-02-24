"use client"

import { useMemo } from "react"
import { useUSGContext } from "../usg/usg_context"
import { useClipboard } from "@/hooks/useClipboard"
import { formatAddress } from "@/lib/other_formatter"
import { formatBigInt } from "@/lib/number_formatter"
import { Button } from "@/components/design_system/inputs/button"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { PopoverTriggerElement } from "@/components/design_system/structure/popover_trigger_element"

export const WalletConnexionContent = () => {
  const { copied, copy } = useClipboard()

  const { connect, disconnect, isConnected, isChainConnected, currentAddress } = useWalletConnexionContext()

  const { USGsUSGMetrics } = useUSGContext()

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

  return (
    <>
      <Popover>
        {isConnected ? (
          <PopoverTrigger asChild>
            <PopoverTriggerElement className="w-full max-w-36">
              <Button>{buttonLabel}</Button>
            </PopoverTriggerElement>
          </PopoverTrigger>
        ) : (
          <Button label="Connect wallet" onClick={handleConnect} className="flex h-10 w-full max-w-36 items-center justify-center" />
        )}

        <PopoverContent align="end">
          {isConnected && currentAddress && (
            <div data-combobox className="flex w-full min-w-80 flex-col overflow-hidden bg-dark p-2 font-gilroy">
              <div className="flex flex-col border-b border-white/10 py-2">
                <span onClick={() => copy(currentAddress)} className="cursor-pointer font-semibold text-white/80 hover:text-white">
                  {copied ? "Copied" : buttonLabel}
                </span>
              </div>

              <div className="my-3 flex w-full items-center justify-between gap-2">
                <ReliefCard className="flex w-full items-center justify-center gap-3 p-2">
                  <TokenImage token="USG" size={24} />

                  <div className="flex flex-col items-start justify-center">
                    <span className="text-xs"> {formatBigInt(USGsUSGMetrics?.USGBalance, 18, 2)} </span>
                    <span className="text-xs text-subtitle">
                      ${formatBigInt(((USGsUSGMetrics?.USGBalance || 0n) * (USGsUSGMetrics?.USGPrice || 0n)) / BigInt(10 ** 18), 18, 2)}
                    </span>
                  </div>
                </ReliefCard>

                <ReliefCard className="flex w-full items-center justify-center gap-3 p-2">
                  <TokenImage token="sUSG" size={24} />

                  <div className="flex flex-col items-start justify-center">
                    <span className="text-xs"> {formatBigInt(USGsUSGMetrics?.sUSGBalance, 18, 2)} </span>
                    <span className="text-xs text-subtitle">
                      ${formatBigInt(((USGsUSGMetrics?.sUSGBalance || 0n) * (USGsUSGMetrics?.sUSGPrice || 0n)) / BigInt(10 ** 18), 18, 2)}
                    </span>
                  </div>
                </ReliefCard>
              </div>

              {/* 
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
              </div> */}

              {isConnected && (
                <div onClick={() => handleDisconnect()} className="flex w-full cursor-pointer items-center justify-start p-2 font-semibold text-danger">
                  Log out
                </div>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </>
  )
}
