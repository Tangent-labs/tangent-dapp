"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import AutoSizer from "react-virtualized-auto-sizer"
import { useMemo, useRef, useState } from "react"
import TokenImage from "../structure/token_image"
import { FixedSizeList as List } from "react-window"
import { DepositReceiveAsset } from "@/components/products/tg_usd/tg_usd_type"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

type OptionT = DepositReceiveAsset

interface AssetSelectionDialogProps<T extends OptionT> {
  options: T[]
  value?: string
  onChange: (v: string) => void
  className?: string
  placeholder?: string
  template: (option: T) => React.ReactNode
  itemSize?: number
  disabled?: boolean
}

const ITEM_HEIGHT = 40

export default function AssetSelectionDialog<T extends OptionT>({
  options,
  value,
  onChange,
  placeholder = "Select…",
  template,
  itemSize = ITEM_HEIGHT,
  disabled,
}: AssetSelectionDialogProps<T>) {
  const [search, setSearch] = useState("")

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<List>(null)

  const selected = useMemo(() => options.find((o) => o.value === value || o.symbol === value) ?? null, [options, value])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const arr = q ? options.filter((o) => (o.symbol ?? "").toLowerCase().includes(q)) : options
    return arr
  }, [options, search])

  const itemKey = (index: number) => filtered[index]?.value ?? filtered[index]?.symbol ?? index

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const opt = filtered[index]
    const isSelected = value === opt.symbol || value === opt.value

    return (
      <div style={style} className="px-2">
        <button
          type="button"
          role="option"
          aria-selected={isSelected}
          className="relative flex w-full cursor-pointer items-center text-sm"
          onClick={() => {
            onChange(opt.symbol)
          }}
        >
          {template(opt)}
        </button>
      </div>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          disabled={disabled}
          type="button"
          className={cn(
            "flex min-h-10 w-full items-center justify-between rounded-[10px] border-white/20 bg-select-input px-2.5 py-1.5 outline-none placeholder:text-muted-foreground focus:outline-none"
          )}
          style={{ borderWidth: 1.5 }}
        >
          <span className="flex items-center gap-2">
            {selected ? (
              <>
                {selected?.symbol === "USG" || selected?.symbol === "ETH" || selected?.symbol === "TAN" ? (
                  <TokenImage token={selected.symbol} size={20} />
                ) : selected?.logoURI ? (
                  <Image src={selected.logoURI} alt={selected.symbol} height={20} width={20} />
                ) : (
                  <TokenImage token={selected.logo} size={20} />
                )}
                <span className="truncate text-sm font-semibold">{selected.symbol}</span>
              </>
            ) : (
              <span className="truncate text-sm opacity-70">{placeholder}</span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
        </button>
      </DialogTrigger>

      <DialogContent className="h-[400px] max-w-[400px] rounded-[10px] bg-overlay-panel p-4 text-white focus:outline-none">
        <div data-combobox className="flex min-h-56 w-full min-w-32 flex-col overflow-hidden">
          <div className="flex w-full items-center justify-start font-semibold text-white">Select a token</div>
          <div className="w-full py-2">
            <Input ref={inputRef} placeholder="Search a token name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {filtered.length ? (
            <div className="h-full">
              <AutoSizer>
                {({ height, width }) => (
                  <List ref={listRef} height={height} width={width} itemCount={filtered.length} itemSize={itemSize} itemKey={itemKey}>
                    {Row}
                  </List>
                )}
              </AutoSizer>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-gray-500">No options available</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
