"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { ListState } from "@/types"
import { Boost } from "@/components/products/usg/usg_type"
import { useUsgBoostsContext } from "@/components/products/usg/airdrop/boosts/usg_boosts_context"
import { boostHeaders } from "@/components/products/usg/airdrop/boosts/usg_boosts_controller"
import { IconReferral } from "@/components/icons"
import { AirdropHeaderV2, StatusDot } from "./header"
import { useResolvedTheme } from "@/v2/theme/use-appearance"
import { lightLogoSrc, markDisc } from "@/v2/theme/logos"

/** V2 Boosts page. Same context (UsgBoostsContext: userBoosts, getSortedRows) as UsgBoostsContent. */
export function BoostsPageV2() {
  const theme = useResolvedTheme()
  const lightLogo = (src: string) => (theme === "light" ? lightLogoSrc(src) : src)
  const { userBoosts, getSortedRows } = useUsgBoostsContext()
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "status", direction: "desc" })
  const rows = useMemo(() => getSortedRows(userBoosts, { search: undefined, sort } as ListState), [userBoosts, getSortedRows, sort])
  const toggle = (key: string) => setSort((s) => (s.key === key ? { key, direction: s.direction === "desc" ? "asc" : "desc" } : { key, direction: "desc" }))
  const sortable = (key: string) => key !== "type"

  return (
    <div className="w-full pb-20 pt-2 font-sans">
      <AirdropHeaderV2 title="Boosts" description="Boost your points by holding eligible assets or by belonging to selected communities." />

      <div className="mt-10 overflow-x-auto rounded-2xl border border-hairline bg-surface px-2 pb-3">
        <div className="sm:min-w-[520px]">
          <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.6fr)_minmax(0,0.8fr)] items-center gap-4 px-4 pb-2 pt-4 text-xs text-ink-3">
            {boostHeaders.map((h) =>
              sortable(h.key as string) ? (
                <button
                  key={h.key}
                  type="button"
                  onClick={() => toggle(h.key as string)}
                  className={cn("flex w-fit items-center gap-1 text-left", sort.key === h.key ? "text-white" : "hover:text-ink-2")}
                >
                  {h.label}
                  {sort.key === h.key && (
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", sort.direction === "asc" && "rotate-180")} strokeWidth={2} />
                  )}
                </button>
              ) : (
                <span key={h.key}>{h.label}</span>
              )
            )}
          </div>
          {(rows as Boost[]).map((b) => (
            <div
              key={b.type}
              className={cn(
                "grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.6fr)_minmax(0,0.8fr)] items-center gap-4 border-b border-white/[0.06] px-4 py-3.5 transition-colors last:border-b-0 hover:bg-white/[0.035]",
                !b.status && "opacity-60"
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                {b.type === "Onboarded User" ? (
                  <IconReferral className="h-7 w-7 shrink-0" />
                ) : (
                  <Image
                    className="h-7 w-7 shrink-0 object-contain"
                    src={lightLogo(`/medias/logos/${b.logo}.webp`)}
                    onLoad={(e) => markDisc(e.currentTarget)}
                    ref={(el) => {
                      if (el?.complete) markDisc(el)
                    }}
                    alt={b.logo}
                    height={28}
                    width={28}
                  />
                )}
                <span className="line-clamp-2 text-[14px] font-semibold leading-5 md:truncate">{b.type}</span>
              </span>
              <span className="text-[15px] tabular-nums">+{b.boost}</span>
              <StatusDot on={b.status} onLabel="Active" offLabel="Not active" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
