"use client"

import { Address } from "viem"
import { IconCopyPaste } from "@/components/icons"
import { formatAddress } from "@/lib/other_formatter"
import { useClipboard } from "@/hooks/useClipboard"
import { ToastComponent } from "@/components/design_system/toast"
import { toast } from "react-toastify"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { Divider } from "@/components/design_system/structure/divider"
import { Copy, ArrowUpRight } from "lucide-react"
import { UI_V2 } from "@/v2/ui"

type MarketDetailsContractsProps = {
  marketContracts: Array<{ name: string; address: Address }>
}

export const MarketDetailsContracts = ({ marketContracts }: MarketDetailsContractsProps) => {
  const { copy } = useClipboard()

  const onClickCopyAddress = (address: string) => {
    copy(address)
    toast.success(ToastComponent, { data: { type: "Success", content: "Address copied to clipboard" } })
  }

  if (UI_V2)
    return (
      <ReliefCard className="p-5">
        <div className="text-[15px] font-semibold">Contracts</div>
        <div className="mt-3 grid grid-cols-1 gap-x-6 md:grid-cols-2">
          {marketContracts.map((c) => (
            <div key={c?.address} className="flex items-center justify-between gap-3 border-b border-divider py-2.5 text-[13px]">
              <span className="text-ink-2">{c.name}</span>
              <span className="flex items-center gap-1">
                <a
                  href={`https://etherscan.io/address/${c?.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium tabular-nums transition-colors hover:bg-white/[0.06]"
                >
                  {formatAddress(c?.address, 4)}
                  <ArrowUpRight className="h-3.5 w-3.5 text-ink-3" strokeWidth={1.75} />
                </a>
                <button
                  type="button"
                  aria-label={`Copy ${c.name} address`}
                  onClick={() => onClickCopyAddress(c?.address)}
                  className="grid h-7 w-7 place-items-center rounded-md text-ink-3 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </span>
            </div>
          ))}
        </div>
      </ReliefCard>
    )

  return (
    <ReliefCard className="hidden flex-col flex-wrap items-start justify-start p-4 md:flex">
      <span className="text-[24px] font-semibold">Contracts</span>

      <Divider />
      <div className="w-full flex-wrap items-center justify-center gap-6 text-sm md:flex">
        {marketContracts.map((c) => (
          <ReliefCard key={c?.address} className="flex w-fit items-center justify-center gap-2 px-4 py-2">
            <div
              onClick={() => window.open(`https://etherscan.io/address/${c?.address}`)}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-[10px] px-2 py-1 hover:bg-white/10"
            >
              <span className="font-semibold">{c.name}</span>
              <span className="hidden xl:flex">{formatAddress(c?.address, 4)}</span>
            </div>
            <IconCopyPaste onClickIcon={() => onClickCopyAddress(c?.address)} className="cursor-pointer fill-white hover:fill-white/30"></IconCopyPaste>
          </ReliefCard>
        ))}
      </div>
    </ReliefCard>
  )
}
