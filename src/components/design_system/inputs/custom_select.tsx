"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FixedSizeList as List } from "react-window"
import AutoSizer from "react-virtualized-auto-sizer"
import { ExistingAsset, SelectOptionAmount } from "@/types"
import { ReactNode, useState } from "react"

interface InputSelectProps<T extends { logoURI?: string; logo?: ExistingAsset; value: string; name?: string; symbol: string }> {
  options?: T[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  value?: string
  template?: (option: T) => ReactNode
}

export const InputSelectAmountTemplate = (option: SelectOptionAmount) => {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm">{option.value}</span>
      <span className="text-xs text-gray-400">{option.amountDisplay && `(${option.amountDisplay})`}</span>
    </div>
  )
}

const CustomSelect = <T extends { logoURI?: string; logo?: ExistingAsset; value: string; name?: string; symbol: string }>({
  options = [],
  onChange,
  placeholder = "Select an option",
  className = "",
  value,
  template,
}: InputSelectProps<T>) => {
  const [search, setSearch] = useState("")

  const filteredOptions = search ? options.filter((option) => option?.symbol.toLowerCase().includes(search.toLowerCase())) : options // When search is empty, show all options

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const option = filteredOptions[index]
    return (
      <div className="absolute left-0 w-full" style={style}>
        <SelectItem key={option.value} value={option?.value}>
          {template ? template(option) : <span className="text-xs">{option.value}</span>}
        </SelectItem>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={className}>
          {value ? (
            template ? (
              template(options.find((option) => option.value === value) as T)
            ) : (
              <span className="text-xs">{options.find((option) => option.value === value)?.symbol}</span>
            )
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          <div className="relative h-56 min-h-56 w-full min-w-72 overflow-hidden pt-14">
            <div className="absolute left-0 top-0 w-full p-2">
              <Input className="rounded-lg focus:outline-none" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <AutoSizer>
              {({ height, width }) => (
                <List height={height} width={width} itemCount={filteredOptions.length} itemSize={40}>
                  {Row}
                </List>
              )}
            </AutoSizer>
          </div>
        </SelectContent>
      </Select>
    </div>
  )
}

export default CustomSelect
