"use client"

import Link from "next/link"
import { ReactNode, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { LockPosition } from "@/components/products/usg/usg_type"
import { formatDate } from "@/lib/other_formatter"
import { formatBigInt } from "@/lib/number_formatter"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/design_system/inputs/button"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { IconInfinity } from "@/components/icons/icon_infinity"
import { useVsTanContext } from "@/components/products/vs_tan/vstan_layout_context"
import { isPermaLocked } from "@/components/products/vs_tan/vstan_layout_controller"
import { useNextEndLockTime } from "@/components/products/vs_tan/use_next_end_lock_time"

const dash = (v: string) => (v && v.trim() !== "" && !v.startsWith("%") ? v : "-")
const TABS = ["lock", "unlock", "claim", "split", "merge"] as const

/** V2 TAN header: title, link to the docs and the vsTAN stats from the same LockData as the live header. */
export function TanHeaderV2() {
  const { lockData } = useVsTanContext()
  const vsTanBalance = useMemo(() => lockData?.positions.reduce((acc, p) => acc + p.amount, 0n), [lockData])

  return (
    <div className="w-full pt-2 font-sans">
      <h1 className="text-[32px] font-semibold tracking-[-0.02em]">TAN</h1>
      <p className="mt-1 max-w-[760px] text-[14px] text-ink-2">
        Lock your TAN for vsTAN to earn a share of protocol revenue and governance rights. Locked positions are tokenized; you can split and merge them.
        Unlocking before the scheduled date results in a penalty.
      </p>
      <Link
        href="https://docs.tangent.finance/docs/tan/vstan"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-[13px] text-ink-2 underline decoration-white/20 underline-offset-2 hover:text-white"
      >
        Learn more about vsTAN <ExternalLink className="h-3 w-3" strokeWidth={2} />
      </Link>

      <div className="mt-8 flex flex-wrap items-stretch gap-y-4">
        <div className="min-w-[220px] flex-[1.6] pr-8">
          <div className="text-xs text-ink-3">Your vsTAN</div>
          <div className="mt-1 flex items-center gap-3">
            <TokenImage token="VSTAN" size={32} className="h-9 w-9" />
            <span className="text-[48px] font-light tabular-nums leading-[1.05] tracking-[-0.02em]">{dash(formatBigInt(vsTanBalance, 18, 2))}</span>
          </div>
        </div>
        {/* LockUI returns the APR as a 1e18-scaled fraction, so 16 decimals gives a percentage */}
        <Stat label="vsTAN APR" value={lockData ? `${formatBigInt(lockData.tanAPR, 16, 2)}%` : "-"} sub="Weekly rewards" />
        <Stat label="Total vsTAN locked" value={dash(formatBigInt(lockData?.totalLocked, 18, 2))} sub="All holders" />
        <Stat label="Supply locked" value={lockData ? `${formatBigInt(lockData.percentageLocked, 16, 2)}%` : "-"} sub="Of circulating TAN" />
      </div>
    </div>
  )
}

/** V2 TAN layout: action card with the five tabs on the left, the locked positions on the right. Children = the live page's form. */
export function TanLayoutV2({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { feature } = useVsTanContext()

  return (
    <div className="mt-10 w-full pb-20 font-sans">
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[440px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-hairline bg-surface p-5">
          <div role="tablist" className="flex gap-1 rounded-[10px] bg-white/[0.04] p-1">
            {TABS.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={feature === t}
                onClick={() => router.push(`/tan/${t}`)}
                className={cn(
                  "h-8 flex-1 rounded-lg text-[13px] font-medium capitalize transition-colors",
                  feature === t ? "bg-white text-black" : "text-ink-2 hover:text-white"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-5">{children}</div>
        </div>
        <Positions />
      </div>
    </div>
  )
}

function Positions() {
  const router = useRouter()
  const { lockData, selectedPosition, setSelectedPosition, extendToPermaLock, onClickExtend, setExtendToPermaLock, onClickRemovePermaLock, feature } =
    useVsTanContext()
  const { nextEndLockTime } = useNextEndLockTime(lockData)
  const [sort, setSort] = useState<{ key: "id" | "amount" | "claimable" | "end"; dir: "asc" | "desc" }>({ key: "id", dir: "asc" })

  const rows = useMemo(() => {
    const val = (p: LockPosition) =>
      sort.key === "id"
        ? Number(p.tokenId)
        : sort.key === "amount"
          ? Number(p.amount)
          : sort.key === "claimable"
            ? Number(p.claimable)
            : isPermaLocked(p)
              ? Infinity
              : Number(p.endLockTime)
    return [...(lockData?.positions ?? [])].sort((a, b) => (sort.dir === "asc" ? 1 : -1) * (val(a) - val(b)))
  }, [lockData, sort])
  const th = (key: typeof sort.key, label: string) => (
    <button
      type="button"
      onClick={() => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))}
      className={cn("flex w-fit items-center gap-1", sort.key === key ? "text-white" : "hover:text-ink-2")}
    >
      {label}
      {sort.key === key && <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", sort.dir === "asc" && "rotate-180")} strokeWidth={2} />}
    </button>
  )

  return (
    <div className="rounded-2xl border border-hairline bg-surface px-2 pb-3 pt-1">
      <div className="px-4 pb-1 pt-4 text-[15px] font-semibold">Locked positions</div>

      {lockData && lockData.positions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <TokenImage token="VSTAN" size={48} className="h-10 w-10" />
          <div className="text-[15px] font-semibold">No locked positions yet</div>
          <p className="max-w-72 text-[13px] text-ink-2">Lock TAN to create your first position and start earning weekly rewards.</p>
          {feature !== "lock" && (
            <Button size="sm" className="mt-2 w-28" onClick={() => router.push("/tan/lock")}>
              Lock TAN
            </Button>
          )}
        </div>
      ) : !lockData ? (
        <p className="px-6 py-14 text-center text-[13px] text-ink-2">Connect your wallet to see your locked positions.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[520px]">
            <div className="grid grid-cols-[0.6fr_1fr_1fr_1fr_24px] items-center gap-3 px-4 pb-2 pt-2 text-xs text-ink-3">
              {th("id", "Position")}
              {th("amount", "vsTAN")}
              {th("claimable", "Claimable")}
              {th("end", "Unlock date")}
              <span />
            </div>

            {rows.map((p) => {
              const open = p === selectedPosition
              const perma = isPermaLocked(p)
              return (
                <div key={p.tokenId.toString()}>
                  <button
                    type="button"
                    onClick={() => setSelectedPosition(open ? undefined : p)}
                    className={cn(
                      "grid w-full grid-cols-[0.6fr_1fr_1fr_1fr_24px] items-center gap-3 border-b border-white/[0.06] px-4 py-3.5 text-left text-[14px] tabular-nums transition-colors last:border-b-0",
                      open ? "bg-white/[0.06]" : "hover:bg-white/[0.035]"
                    )}
                  >
                    <span className="font-semibold">#{p.tokenId.toString()}</span>
                    <span className="flex items-center gap-1.5">
                      {formatBigInt(p.amount, 18, 2)} <TokenImage token="VSTAN" size={16} className="h-4 w-4" />
                    </span>
                    <span className="flex items-center gap-1.5">
                      {formatBigInt(p.claimable, 18, 2)} <TokenImage token="USG" size={16} className="h-4 w-4" />
                    </span>
                    <span className="flex items-center">
                      {perma ? <IconInfinity className="h-auto w-4" /> : formatDate(new Date(Number(p.endLockTime) * 1000), "dd/MM/yyyy")}
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-ink-3 transition-transform", open && "rotate-180")} strokeWidth={2} />
                  </button>

                  {open && (
                    <div className="mx-2 mb-1 flex flex-wrap items-center justify-between gap-3 rounded-b-[10px] border-t border-divider bg-white/[0.03] px-4 py-3">
                      <span className="text-[13px] text-ink-2">
                        {perma
                          ? "Perma-locked: never unlocks until you remove it."
                          : extendToPermaLock
                            ? "Extend to a perma lock"
                            : nextEndLockTime
                              ? `Extend to ${formatDate(new Date(Number(nextEndLockTime) * 1000), "dd/MM/yyyy")}`
                              : "Extend this lock"}
                      </span>
                      {perma ? (
                        <Button size="sm" className="w-40" onClick={() => onClickRemovePermaLock()}>
                          Remove permalock
                        </Button>
                      ) : (
                        <div className="flex items-center gap-4">
                          <label
                            className="flex cursor-pointer items-center gap-2 text-xs text-ink-2"
                            title="Lock your tokens in perpetuity. You can remove the permalock at any time."
                          >
                            Permalock
                            <Switch checked={extendToPermaLock} onCheckedChange={() => setExtendToPermaLock(!extendToPermaLock)} />
                          </label>
                          <Button size="sm" className="w-24" onClick={() => onClickExtend(selectedPosition!)}>
                            Extend
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-[150px] flex-1 border-l border-divider px-6">
      <div className="text-xs text-ink-3">{label}</div>
      <div className="mt-1 whitespace-nowrap text-[24px] font-medium tabular-nums tracking-[-0.02em]">{value}</div>
      {sub && <div className="mt-1.5 text-xs text-ink-2">{sub}</div>}
    </div>
  )
}
