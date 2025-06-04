"use client"

import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FixedSizeList as List } from "react-window"
import AutoSizer from "react-virtualized-auto-sizer"
import { ReactNode, useState } from "react"
import TokenImage from "../structure/token_image"
import { DepositReceiveAsset } from "@/components/products/tg_usd/tg_usd_type"

interface InputSelectProps<T extends DepositReceiveAsset> {
  options?: T[]
  onChange: (value: string) => void
  className?: string
  value?: string
  template?: (option: T) => ReactNode
}

const CustomSelect = <T extends DepositReceiveAsset>({ options = [], onChange, className = "", value, template }: InputSelectProps<T>) => {
  const [search, setSearch] = useState("")

  const filteredOptions = search ? options.filter((option) => option?.symbol.toLowerCase().includes(search.toLowerCase())) : options

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const option = filteredOptions[index]

    return (
      <div className="absolute left-0 flex w-full" style={style}>
        <SelectItem key={option.value} value={option.symbol}>
          {template ? (
            template(option)
          ) : (
            <div className="flex cursor-pointer items-center gap-2">
              {option.logoURI ? <Image src={option.logoURI} alt={option.symbol} height={24} width={24} /> : <TokenImage token={option.logo} size={20} />}
              <span>{option.symbol}</span>
            </div>
          )}
        </SelectItem>
      </div>
    )
  }

  const opt = options.find((option) => option.value === value || option.symbol === value) || null

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={className}>
          <div className="flex w-full items-center justify-between">
            <div className="flex w-full items-center gap-2">
              {opt ? (
                <>
                  {opt.logoURI ? <Image src={opt.logoURI} alt={opt.symbol} height={24} width={24} /> : <TokenImage token={opt.logo} size={24} />}
                  <span className="text-sm font-bold">{opt.symbol}</span>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </SelectTrigger>
        <SelectContent>
          <div className="flex min-h-56 w-full min-w-56 flex-col overflow-hidden bg-input">
            <div className="w-full p-2">
              <Input className="rounded-lg focus:outline-none" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {filteredOptions.length > 0 ? (
              <AutoSizer>
                {({ height, width }) => (
                  <List height={height} width={width} itemCount={filteredOptions.length} itemSize={40}>
                    {Row}
                  </List>
                )}
              </AutoSizer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">No options available</div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  )
}

export default CustomSelect
