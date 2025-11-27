"use client"

import { Address } from "viem"
import { IconCopyPaste } from "@/components/icons/icon_copy_paste"
import { formatAddress } from "@/lib/other_formatter"
import { useClipboard } from "@/hooks/useClipboard"
import { ToastComponent } from "@/components/design_system/toast"
import { toast } from "react-toastify"

type MarketDetailsContractsProps = {
  marketContracts: Array<{ name: string; address: Address }>
}

export const MarketDetailsContracts = ({ marketContracts }: MarketDetailsContractsProps) => {
  const { copy } = useClipboard()

  const onClickCopyAddress = (address: string) => {
    copy(address)
    toast.success(ToastComponent, { data: { type: "Success", content: "Address copied to clipboard" } })
  }

  return (
    <div className="mt-4 hidden h-28 flex-wrap items-center justify-center gap-6 rounded-[10px] bg-overlay-panel p-4 text-sm backdrop-blur-[60px] md:flex">
      {marketContracts.map((c) => (
        <div key={c?.address} className="flex w-fit items-center justify-center gap-3 rounded-[10px] bg-overlay-panel px-4 py-2">
          <div
            onClick={() => window.open(`https://etherscan.io/address/${c?.address}`)}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-[10px] px-2 py-1 hover:bg-white/10"
          >
            <span className="font-semibold">{c.name}</span>
            <span className="hidden xl:flex">{formatAddress(c?.address, 4)}</span>
          </div>
          <IconCopyPaste onClickIcon={() => onClickCopyAddress(c?.address)} className="cursor-pointer fill-white hover:fill-white/30"></IconCopyPaste>
        </div>
      ))}
    </div>
  )
}
