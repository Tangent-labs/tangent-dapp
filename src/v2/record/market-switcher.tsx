"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { formatUnits } from "viem"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { ListRowData } from "@/types"
import { formatMillions } from "@/lib/number_formatter"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { ActionSheet, useIsMobile } from "@/v2/ui/mobile-action-bar"
import { useUSGMaketListContext } from "@/components/products/usg/list/usg_market_list_context"

const kindOf = (r: ListRowData) => (r.isFixedRate ? "FIR" : r.type)

/**
 * Market name that opens a searchable switcher (command palette feel): type to filter, arrows, Enter, Escape.
 * Rows come from the USGMarketListProvider the market route layout already mounts, so the list is ready the moment it opens.
 */
export function MarketSwitcherV2({ address, name, logoKey }: { address?: string; name?: string; logoKey?: string }) {
  const [open, setOpen] = useState(false)
  const mobile = useIsMobile()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // the phone sheet is portaled to the body and closes itself
    if (!open || mobile) return
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [open, mobile])

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="focus-visible:ring-action/60 group -ml-2 flex items-center gap-3 rounded-xl px-2 py-1 outline-none transition-colors hover:bg-white/[0.04] focus-visible:ring-2"
      >
        <TokenImage token={logoKey} size={48} className="h-10 w-auto" />
        <span className="text-[32px] font-semibold tracking-[-0.02em]">{name}</span>
        <ChevronDown className={cn("h-5 w-5 text-ink-3 transition-transform duration-200 group-hover:text-ink-2", open && "rotate-180")} strokeWidth={2} />
      </button>
      {/* phones: the switcher opens as a bottom sheet */}
      {mobile && (
        <ActionSheet open={open} onClose={() => setOpen(false)} title="Switch market">
          <div className="-mx-4 -mt-3">
            <Panel current={address} close={() => setOpen(false)} />
          </div>
        </ActionSheet>
      )}
      <AnimatePresence>
        {open && !mobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ duration: 0.16, ease: [0.25, 0.8, 0.25, 1] }}
            style={{ transformOrigin: "top left" }}
            className="absolute left-0 top-[calc(100%+8px)] z-50 w-[440px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-raised shadow-pop"
          >
            <Panel current={address} close={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Panel({ current, close }: { current?: string; close: () => void }) {
  const { displayRows, globalData } = useUSGMaketListContext()
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState("")
  const [active, setActive] = useState(0)
  const loading = globalData.USGPrice === "-"

  useEffect(() => {
    // no keyboard on phones until the user taps the search
    if (!window.matchMedia("(max-width: 767px)").matches) requestAnimationFrame(() => input.current?.focus())
  }, [])

  const groups = useMemo(() => {
    const s = q.trim().toLowerCase()
    const tvl = (r: ListRowData) => Number(formatUnits(BigInt(r.totalCollateralUSDValue || "0"), 18))
    const list = displayRows.filter((r) => !s || r.name.toLowerCase().includes(s) || kindOf(r).toLowerCase() === s).sort((a, b) => tvl(b) - tvl(a))
    return (["HEC", "LEC", "FIR"] as const).map((k) => ({ k, items: list.filter((r) => kindOf(r) === k), tvl })).filter((g) => g.items.length)
  }, [displayRows, q])
  const flat = groups.flatMap((g) => g.items)

  // start on the current market once rows arrive
  useEffect(() => {
    const i = flat.findIndex((r) => r.address.toLowerCase() === current?.toLowerCase())
    if (i >= 0 && !q) setActive(i)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flat.length])

  const go = (r: ListRowData) => {
    close()
    if (r.address.toLowerCase() !== current?.toLowerCase()) router.push(`/${r.address}/deposit-borrow`)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return close()
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + flat.length) % Math.max(1, flat.length))
    }
    if (e.key === "Enter" && flat[active]) go(flat[active])
  }

  return (
    <div onKeyDown={onKey}>
      <label className="flex items-center gap-2.5 border-b border-divider px-4 py-3">
        <Search className="h-4 w-4 text-ink-3" strokeWidth={1.75} />
        <input
          ref={input}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setActive(0)
          }}
          placeholder="Switch market"
          className="w-full bg-transparent text-[14px] outline-none placeholder:text-ink-3"
        />
        <kbd className="hidden rounded-[5px] border border-hairline px-1.5 text-[11px] text-ink-3 md:inline">esc</kbd>
      </label>
      <div role="listbox" className="v2-scroll max-h-[380px] overflow-y-auto p-1.5">
        {loading && Array.from({ length: 6 }, (_, i) => <div key={i} className="v2-shimmer mx-1.5 my-1 h-9 rounded-[8px]" />)}
        {!loading && flat.length === 0 && <p className="px-3 py-6 text-center text-[13px] text-ink-2">No market matches “{q}”.</p>}
        {!loading &&
          groups.map((g) => (
            <div key={g.k}>
              <div className="px-3 pb-1 pt-2 text-[11px] font-medium text-ink-3">{g.k}</div>
              {g.items.map((r) => {
                const idx = flat.indexOf(r)
                const selected = r.address.toLowerCase() === current?.toLowerCase()
                return (
                  <button
                    key={r.address}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onPointerEnter={() => setActive(idx)}
                    onClick={() => go(r)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[8px] px-3 py-2 text-left transition-colors duration-100",
                      idx === active && "bg-white/[0.07]"
                    )}
                  >
                    <TokenImage token={r.logoKey} size={24} className="h-6 w-auto shrink-0" />
                    <span className="flex-1 truncate text-[13px] font-medium">{r.name}</span>
                    <span className="w-16 text-right text-[13px] font-semibold tabular-nums">{(r.apr.current ?? 0).toFixed(2)}%</span>
                    <span className="w-16 text-right text-xs tabular-nums text-ink-3">${formatMillions(g.tvl(r))}</span>
                    <Check className={cn("h-3.5 w-3.5", selected ? "opacity-100" : "opacity-0")} strokeWidth={2} />
                  </button>
                )
              })}
            </div>
          ))}
      </div>
      <div className="flex justify-between border-t border-divider px-4 py-2 text-[11px] text-ink-3">
        <span className="hidden md:inline">↑ ↓ to move, enter to open</span>
        <span>vAPR · TVL</span>
      </div>
    </div>
  )
}
