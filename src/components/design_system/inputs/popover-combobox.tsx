"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import AutoSizer from "react-virtualized-auto-sizer"
import { useMemo, useRef, useState } from "react"
import { TokenImage } from "../structure/token_image"
import { FixedSizeList as List } from "react-window"
import { DepositReceiveAsset } from "@/components/products/usg/usg_type"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type OptionT = DepositReceiveAsset

interface ComboboxProps<T extends OptionT> {
  options: T[]
  value?: string
  onChange: (v: string) => void
  className?: string
  placeholder?: string
  template: (option: T) => React.ReactNode
  itemSize?: number
}

const ITEM_HEIGHT = 40

export function PopoverCombobox<T extends OptionT>({
  options,
  value,
  onChange,
  className,
  placeholder = "Select…",
  template,
  itemSize = ITEM_HEIGHT,
}: ComboboxProps<T>) {
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
    <div className={cn("w-full", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex min-h-10 w-full items-center justify-between rounded-[10px] border-tangent border-white/20 bg-select-input px-2.5 py-1.5 placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              {selected ? (
                <>
                  {selected?.symbol === "USG" || selected?.symbol === "ETH" || selected?.symbol === "TAN" ? (
                    <TokenImage token={selected.symbol} size={20} />
                  ) : selected?.logoURI ? (
                    <Image src={selected.logoURI} alt={selected.symbol} height={20} width={20} />
                  ) : (
                    <TokenImage token={selected.logo} size={32} />
                  )}
                  <span className="truncate text-sm font-semibold">{selected.symbol}</span>
                </>
              ) : (
                <span className="truncate text-sm opacity-70">{placeholder}</span>
              )}
            </span>
            <ChevronDown className="ml-1 h-4 w-4 shrink-0 opacity-80" />
          </button>
        </PopoverTrigger>

        <PopoverContent>
          <div data-combobox className="flex min-h-56 w-full min-w-56 flex-col overflow-hidden">
            <div className="w-full p-2">
              <Input ref={inputRef} placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {filtered.length ? (
              <div className="h-60">
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
        </PopoverContent>
      </Popover>
    </div>
  )
}
