"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import AutoSizer from "react-virtualized-auto-sizer"
import { FixedSizeList as List } from "react-window"
import { ChevronDown } from "lucide-react"

import { TokenImage } from "../structure/token_image"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { DepositReceiveAsset } from "@/components/products/usg/usg_type"
import { ExistingAsset } from "@/types"

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

const ITEM_HEIGHT = 38

const RenderAsset = <T extends OptionT>({ selected, placeholder }: { selected: T | null; placeholder: string }) => {
  return (
    <>
      {selected ? (
        <>
          {!!selected?.logoURI ? (
            <Image src={selected.logoURI} alt={selected.symbol} height={20} width={20} />
          ) : !selected?.symbol.includes("-") ? (
            <TokenImage token={selected.symbol as ExistingAsset} size={20} />
          ) : (
            <TokenImage token={selected.symbol as ExistingAsset} size={32} />
          )}
          <span className="text-sm font-semibold">{selected.symbol}</span>
        </>
      ) : (
        <span className="text-sm opacity-70">{placeholder}</span>
      )}
    </>
  )
}

export function AssetSelectionDialog<T extends OptionT>({
  options,
  value,
  onChange,
  placeholder = "Select…",
  template,
  itemSize = ITEM_HEIGHT,
  disabled,
}: AssetSelectionDialogProps<T>) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const listRef = useRef<List>(null)

  const selected = useMemo(() => options.find((o) => o.value === value || o.symbol === value) ?? null, [options, value])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const arr = q ? options.filter((o) => (o.symbol ?? "").toLowerCase().includes(q)) : options
    return arr
  }, [options, search])

  const itemKey = (index: number) => filtered[index]?.value ?? filtered[index]?.symbol ?? index

  const handleSelect = (symbol: string) => {
    onChange(symbol)
    setOpen(false) // ← close dialog
    setSearch("") // optional: reset search
  }

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const opt = filtered[index]
    const isSelected = value === opt.symbol || value === opt.value

    return (
      <div style={style}>
        <button
          type="button"
          role="option"
          aria-selected={isSelected}
          className="relative flex w-full cursor-pointer items-center text-sm"
          onClick={() => {
            handleSelect(opt.symbol)
          }}
        >
          {template(opt)}
        </button>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          disabled={disabled}
          type="button"
          className="flex h-[38px] items-center justify-between rounded-[10px] border-white/20 bg-select-input px-2.5 transition-all duration-200 hover:scale-[1.02] hover:bg-white/5 active:scale-[0.99]"
          style={{ borderWidth: 1.5 }}
        >
          <span className="flex items-center gap-2">
            <RenderAsset selected={selected} placeholder={placeholder} />
          </span>
          <ChevronDown className="ml-1 h-4 w-4 opacity-80" />
        </button>
      </DialogTrigger>

      <DialogContent className="h-[500px] w-full max-w-[500px] rounded-[10px] bg-overlay-panel p-4 text-white">
        <div data-combobox className="flex min-h-56 w-full min-w-32 flex-col">
          <div className="flex w-full items-center justify-start text-lg font-semibold text-white">Select a token</div>
          <div className="w-full py-2">
            <Input ref={inputRef} placeholder="Search a token name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {filtered.length ? (
            <div className="h-full">
              <AutoSizer className="w-full">
                {({ height, width }) => (
                  <List
                    className="scrollbar-thin"
                    ref={listRef}
                    height={height}
                    width={width}
                    itemCount={filtered.length}
                    itemSize={itemSize}
                    itemKey={itemKey}
                  >
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
