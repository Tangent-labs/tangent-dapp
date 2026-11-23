"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { formatAddress } from "@/lib/other_formatter"
import { TokenImage } from "@/components/design_system/structure/token_image"

/** Fields the live option objects carry (DepositReceiveAsset, plus AssetInfos balances when the caller has them). */
export type TokenOption = {
  value: string
  symbol: string
  logoURI?: string
  logoKey?: string
  address?: string
  balanceFormatted?: string
  balanceNumber?: number
  price?: number
}

/**
 * V2 token picker for AssetSelectionDialog: same options, same onChange, same value matching (value or symbol).
 * Chip trigger, then a command-palette dialog: search, "Your tokens" first, balances, arrows + Enter.
 */
export function TokenDialogV2({
  options,
  selected,
  onSelect,
  placeholder,
  disabled,
}: {
  options: TokenOption[]
  selected: TokenOption | null
  onSelect: (symbol: string) => void
  placeholder: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const { owned, rest, flat } = useMemo(() => {
    const s = q.trim().toLowerCase()
    const list = s
      ? options.filter((o) => o.symbol?.toLowerCase().includes(s) || o.address?.toLowerCase() === s || o.address?.toLowerCase().startsWith(s))
      : options
    const owned = list.filter((o) => (o.balanceNumber ?? 0) > 0)
    const rest = list.filter((o) => !((o.balanceNumber ?? 0) > 0))
    return { owned, rest, flat: [...owned, ...rest] }
  }, [options, q])

  useEffect(() => {
    if (!open) return
    setQ("")
    const i = options.findIndex((o) => o === selected)
    setActive(Math.max(0, i))
  }, [open, options, selected])

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" })
  }, [active])

  const pick = (o: TokenOption) => {
    onSelect(o.symbol)
    setOpen(false)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + flat.length) % Math.max(1, flat.length))
    }
    if (e.key === "Enter" && flat[active]) pick(flat[active])
  }

  const row = (o: TokenOption) => {
    const idx = flat.indexOf(o)
    const isSel = selected === o
    const usd = o.price !== undefined && o.balanceNumber ? o.price * o.balanceNumber : undefined
    return (
      <button
        key={o.value + o.symbol}
        type="button"
        role="option"
        aria-selected={isSel}
        data-idx={idx}
        onPointerMove={() => setActive(idx)}
        onClick={() => pick(o)}
        className={cn("flex w-full items-center gap-3 rounded-[8px] px-3 py-2 text-left transition-colors duration-100", idx === active && "bg-white/[0.07]")}
      >
        <TokenMark o={o} size={28} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-medium">{o.symbol}</span>
          {o.address && <span className="block text-xs tabular-nums text-ink-3">{formatAddress(o.address as `0x${string}`, 4)}</span>}
        </span>
        {o.balanceFormatted !== undefined && (
          <span className="text-right">
            <span className={cn("block text-[13px] tabular-nums", (o.balanceNumber ?? 0) > 0 ? "text-white" : "text-ink-3")}>{o.balanceFormatted}</span>
            {usd !== undefined && usd > 0 && (
              <span className="block text-xs tabular-nums text-ink-3">${usd.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
            )}
          </span>
        )}
        <Check className={cn("h-3.5 w-3.5 shrink-0", isSel ? "text-white" : "text-transparent")} strokeWidth={2} />
      </button>
    )
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild disabled={disabled}>
        <button
          type="button"
          disabled={disabled}
          className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-white/[0.07] pl-1.5 pr-2 text-[13px] font-medium transition-colors hover:bg-white/[0.11] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {selected ? (
            <>
              <TokenMark o={selected} size={22} />
              {selected.symbol}
            </>
          ) : (
            <span className="pl-1 text-ink-3">{placeholder}</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-ink-3" strokeWidth={2} />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onKeyDown={onKey}
          className="fixed left-1/2 top-[14vh] z-50 w-[440px] max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-raised font-sans text-white shadow-[0_24px_60px_rgba(0,0,0,0.55)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.97]"
        >
          <DialogPrimitive.Title className="sr-only">Select a token</DialogPrimitive.Title>
          <label className="flex items-center gap-2.5 border-b border-divider px-4 py-3">
            <Search className="h-4 w-4 text-ink-3" strokeWidth={1.75} />
            <input
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setActive(0)
              }}
              placeholder="Search a token or paste an address"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-ink-3"
            />
            <kbd className="rounded-[5px] border border-hairline px-1.5 text-[11px] text-ink-3">esc</kbd>
          </label>
          <div ref={listRef} role="listbox" className="v2-scroll max-h-[min(440px,60vh)] overflow-y-auto p-1.5">
            {flat.length === 0 && <p className="px-3 py-8 text-center text-[13px] text-ink-2">No token matches “{q}”.</p>}
            {owned.length > 0 && (
              <>
                <div className="px-3 pb-1 pt-2 text-[11px] font-medium text-ink-3">Your tokens</div>
                {owned.map(row)}
              </>
            )}
            {rest.length > 0 && (
              <>
                {owned.length > 0 && <div className="px-3 pb-1 pt-3 text-[11px] font-medium text-ink-3">All tokens</div>}
                {rest.map(row)}
              </>
            )}
          </div>
          <div className="flex justify-between border-t border-divider px-4 py-2 text-[11px] text-ink-3">
            <span>↑ ↓ to move, enter to select</span>
            <span>{options.length} tokens</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** Logo from the token list, else the repo logo, else initials (never a blank gap). */
function TokenMark({ o, size }: { o: TokenOption; size: number }) {
  const [broken, setBroken] = useState(false)
  if (o.logoURI && !broken)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={o.logoURI}
        alt=""
        width={size}
        height={size}
        onError={() => setBroken(true)}
        className="shrink-0 rounded-full"
        style={{ width: size, height: size }}
      />
    )
  if (o.logoKey) return <TokenImage token={o.logoKey} size={size >= 28 ? 32 : 24} className="shrink-0" style={{ height: size, width: "auto" }} />
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-white/[0.12] text-[10px] font-semibold text-ink-2" style={{ width: size, height: size }}>
      {o.symbol?.slice(0, 2)}
    </span>
  )
}
