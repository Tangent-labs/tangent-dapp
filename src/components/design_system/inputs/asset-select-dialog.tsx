"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import AutoSizer from "react-virtualized-auto-sizer"
import { FixedSizeList as List } from "react-window"
import { ChevronDown } from "lucide-react"

import { TokenImage } from "../structure/token_image"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DepositReceiveAsset } from "@/components/products/usg/usg_type"

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

const receiptTokensLabelsToDelete = ["Gauge ", "Vault "]
const RenderAsset = <T extends OptionT>({ selected, placeholder }: { selected: T | null; placeholder: string }) => {
  let symbolURI = selected?.symbol

  // Clean "Gauge " or "Vault " prefixes
  if (symbolURI) {
    receiptTokensLabelsToDelete.forEach((labelToDel) => {
      if (symbolURI!.includes(labelToDel)) {
        symbolURI = symbolURI?.split(labelToDel)[1]
      }
    })
  }
  return (
    <>
      {selected ? (
        <>
          {!!selected?.logoURI ? (
            <Image src={selected.logoURI} alt={selected.symbol} height={20} width={20} />
          ) : !selected?.symbol.includes("-") ? (
            <TokenImage token={symbolURI} size={20} />
          ) : (
            <TokenImage token={symbolURI} size={32} />
          )}
          <span className="text-sm font-semibold">{selected.symbol?.replaceAll("-", "/")}</span>
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

  const selected = useMemo(
    () =>
      options.find((o) => {
        return o.value === value || o.symbol === value
      }) ?? null,
    [options, value]
  )

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
        <div className="rounded-[10px] border border-white/10 p-0 transition-all duration-200 hover:scale-[1.02] hover:bg-white/5 active:scale-[0.99]">
          <button disabled={disabled} type="button" className="flex h-10 w-full items-center justify-between rounded-[9px] bg-select-input px-2.5">
            <span className="flex items-center gap-2">
              <RenderAsset selected={selected} placeholder={placeholder} />
            </span>
            <ChevronDown className="ml-1 h-4 w-4 opacity-80" />
          </button>
        </div>
      </DialogTrigger>

      <DialogContent aria-describedby={undefined} className="h-[500px] w-full max-w-[500px] rounded-[10px] bg-overlay-panel p-4 text-white">
        <div data-combobox className="flex min-h-56 w-full min-w-32 flex-col">
          <DialogTitle className="text-lg font-semibold text-white">Select a token</DialogTitle>
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
