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
import { cn } from "@/lib/utils"

type WalletConnexionContentProps = {
  className?: string
  classNameChild?: string
}

export function WalletConnexionContent({ className, classNameChild }: WalletConnexionContentProps) {
  const { copied, copy } = useClipboard()

  const { connect, disconnect, isConnected, isChainConnected, currentAddress } = useWalletConnexionContext()

  const { USGsUSGMetrics } = useUSGContext()

  const buttonLabel = useMemo(() => {
    if (!isConnected) return "Connect Wallet"
    if (!isChainConnected) return "Switch Network"
    return formatAddress(currentAddress) || "Unknown Address"
  }, [isConnected, isChainConnected, currentAddress])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <PopoverTriggerElement
          className={cn("w-full max-w-36", className)}
          onClick={(e) => {
            if (!isConnected) {
              e.preventDefault()
              connect()
            }
          }}
        >
          <Button classNameChild={classNameChild}>{buttonLabel}</Button>
        </PopoverTriggerElement>
      </PopoverTrigger>

      {isConnected && currentAddress && (
        <PopoverContent align="end">
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

            {isConnected && (
              <div onClick={() => disconnect()} className="flex w-full cursor-pointer items-center justify-start p-2 font-semibold text-danger">
                Log out
              </div>
            )}
          </div>
        </PopoverContent>
      )}
    </Popover>
  )
}
