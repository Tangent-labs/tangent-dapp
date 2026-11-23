"use client"

import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"
import { useUSGContext } from "../usg/usg_context"
import { useClipboard } from "@/hooks/useClipboard"
import { formatAddress } from "@/lib/other_formatter"
import { formatBigInt } from "@/lib/number_formatter"
import { Button } from "@/components/design_system/inputs/button"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { ChevronDown, Copy, LayoutGrid, LogOut } from "lucide-react"
import Link from "next/link"
import { UI_V2 } from "@/v2/ui"
import { WalletOrb } from "@/v2/shell/wallet-orb"

type WalletConnexionContentProps = {
  className?: string
}

export function WalletConnexionContent({ className }: WalletConnexionContentProps) {
  const { copied, copy } = useClipboard()

  const { USGsUSGMetrics } = useUSGContext()

  const { connect, disconnect, isConnected, isChainConnected, currentAddress } = useWalletConnexionContext()

  const [popoverOpen, setPopoverOpen] = useState(false)

  const buttonLabel = useMemo(() => {
    if (!isConnected) return "Connect Wallet"
    if (!isChainConnected) return "Switch Network"
    return formatAddress(currentAddress) || "Unknown Address"
  }, [isConnected, isChainConnected, currentAddress])

  if (UI_V2) {
    const ready = isConnected && isChainConnected && !!currentAddress
    const balances = [
      { token: "USG", amount: USGsUSGMetrics?.USGBalance, price: USGsUSGMetrics?.USGPrice },
      { token: "sUSG", amount: USGsUSGMetrics?.sUSGBalance, price: USGsUSGMetrics?.sUSGPrice },
    ]
    return (
      <Popover
        open={isConnected && popoverOpen}
        onOpenChange={(open) => {
          if (!isConnected) return
          setPopoverOpen(open)
        }}
      >
        <PopoverAnchor asChild>
          {!ready ? (
            <button
              type="button"
              onClick={() => (isConnected ? setPopoverOpen((v) => !v) : connect())}
              className={cn(
                "h-10 shrink-0 rounded-[10px] bg-action px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#1a84ff] active:scale-[0.98]",
                className
              )}
            >
              {isConnected ? "Switch network" : "Connect wallet"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPopoverOpen((v) => !v)}
              aria-expanded={popoverOpen}
              className={cn(
                "flex h-10 shrink-0 items-center gap-2.5 rounded-[10px] border border-hairline bg-white/[0.03] pl-2 pr-3 text-[13px] font-medium transition-colors hover:border-white/15",
                className
              )}
            >
              <WalletOrb address={currentAddress} size={24} />
              <span className="tabular-nums">{buttonLabel}</span>
              <ChevronDown className={cn("h-3.5 w-3.5 text-ink-3 transition-transform duration-200", popoverOpen && "rotate-180")} strokeWidth={2} />
            </button>
          )}
        </PopoverAnchor>

        {isConnected && currentAddress && (
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[260px] rounded-xl border border-white/10 bg-[#1a1a1d] p-1.5 font-sans shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center gap-2.5 px-2.5 pb-2.5 pt-1.5">
              <WalletOrb address={currentAddress} size={32} />
              <div className="min-w-0">
                <div className="text-[13px] font-medium tabular-nums">{formatAddress(currentAddress)}</div>
                <button
                  type="button"
                  onClick={() => copy(currentAddress)}
                  className="flex items-center gap-1 text-xs text-ink-3 transition-colors hover:text-white"
                >
                  <Copy className="h-3 w-3" strokeWidth={1.75} />
                  {copied ? "Copied" : "Copy address"}
                </button>
              </div>
            </div>
            <div className="mx-1 mb-1.5 grid grid-cols-2 gap-1.5">
              {balances.map((b) => (
                <div key={b.token} className="rounded-lg bg-white/[0.04] px-2.5 py-2">
                  <div className="flex items-center gap-1.5 text-xs text-ink-2">
                    <TokenImage token={b.token} size={16} /> {b.token}
                  </div>
                  <div className="mt-1 text-[13px] font-medium tabular-nums">{formatBigInt(b.amount, 18, 2)}</div>
                  <div className="text-[11px] tabular-nums text-ink-3">${formatBigInt(((b.amount || 0n) * (b.price || 0n)) / BigInt(10 ** 18), 18, 2)}</div>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard"
              onClick={() => setPopoverOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors hover:bg-white/[0.06]"
            >
              <LayoutGrid className="h-4 w-4 text-ink-2" strokeWidth={1.75} /> Dashboard
            </Link>
            <button
              type="button"
              onClick={() => {
                disconnect()
                setPopoverOpen(false)
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors hover:bg-white/[0.06]"
            >
              <LogOut className="h-4 w-4 text-ink-2" strokeWidth={1.75} /> Disconnect
            </button>
          </PopoverContent>
        )}
      </Popover>
    )
  }

  return (
    <Popover
      open={isConnected && popoverOpen}
      onOpenChange={(open) => {
        if (!isConnected) return
        setPopoverOpen(open)
      }}
    >
      <PopoverAnchor asChild>
        <div
          className={cn("flex w-full max-w-36 items-center justify-center", className)}
          onClick={(e) => {
            if (!isConnected) {
              e.preventDefault()
              e.stopPropagation()
              connect()
              return
            }
            setPopoverOpen((prev) => !prev)
          }}
        >
          <Button classNameChild="py-[9px] md:py-[10.5px] px-1">{buttonLabel}</Button>
        </div>
      </PopoverAnchor>

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
              <div
                onClick={() => {
                  disconnect()
                  setPopoverOpen(false)
                }}
                className="flex w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#FF030010] p-2 font-semibold text-danger hover:bg-[#FF030016]"
              >
                Disconnect wallet
              </div>
            )}
          </div>
        </PopoverContent>
      )}
    </Popover>
  )
}
