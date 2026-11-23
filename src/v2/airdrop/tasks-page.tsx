"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpRight, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { ListState } from "@/types"
import { LpTask, VoteTask } from "@/components/products/usg/usg_type"
import { useUsgTasksContext } from "@/components/products/usg/airdrop/tasks/usg_tasks_context"
import { lpListHeaders, tasksProtocolOptions, tasksTypeOptions, voteListHeaders } from "@/components/products/usg/airdrop/tasks/usg_tasks_controller"
import { SlidingTabs } from "@/components/products/usg/airdrop/tasks/components/SlidingTabs"
import { LpTaskCustomAssetDisplay } from "@/components/products/usg/airdrop/tasks/components/custom_token_display"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { formatMillions } from "@/lib/number_formatter"
import { SelectMenu } from "@/v2/ui/select-menu"
import { AirdropHeaderV2, StatusDot } from "./header"

const PROTOCOL_TOKEN: Record<string, { token: string; label: string }> = {
  tangent: { token: "USG", label: "Tangent" },
  convex: { token: "CVX", label: "Convex" },
  "cvx.eth": { token: "CVX", label: "Convex" },
  curve: { token: "CRV", label: "Curve" },
  crv: { token: "CRV", label: "Curve" },
  stakedao: { token: "SDT", label: "Stake DAO" },
  "sdcrv.eth": { token: "SDT", label: "Stake DAO" },
  "sdfxn.eth": { token: "SDT", label: "Stake DAO" },
  "sdpendle.eth": { token: "SDT", label: "Stake DAO" },
  pendle: { token: "PENDLE", label: "Pendle" },
  morpho: { token: "morpho", label: "Morpho" },
  balancer: { token: "balancer", label: "Balancer" },
  fxn: { token: "FXN", label: "FXN" },
}

function Protocol({ name }: { name: string }) {
  const p = PROTOCOL_TOKEN[name?.toLowerCase()]
  if (!p) return <span className="text-[13px] text-ink-2">{name}</span>
  return (
    <span className="flex items-center gap-2 text-[13px]">
      <TokenImage token={p.token} size={16} className="h-4 w-4" />
      {p.label}
    </span>
  )
}

type Sort = { key: string; direction: "asc" | "desc" }

/**
 * V2 Tasks page. Same context (UsgTasksContext: LP and vote tasks, filters, search, sort helpers) as UsgTasksContent.
 */
export function TasksPageV2() {
  const router = useRouter()
  const {
    lpTasks,
    voteTasks,
    lpTaskProtocol,
    lpTaskType,
    voteTaskProtocol,
    lpTaskSearchValue,
    lpTaskFilteredBy,
    selectedFeature,
    voteTaskSearchValue,
    getSortedLpRows,
    getSortedVoteRows,
    setLpTaskProtocol,
    setLpTaskType,
    setVoteTaskProtocol,
    setLpTaskFilteredBy,
    setLpTaskSearchValue,
    setSelectedFeature,
    setVoteTaskSearchValue,
  } = useUsgTasksContext()
  const [lpSort, setLpSort] = useState<Sort>({ key: "points", direction: "desc" })
  const [voteSort, setVoteSort] = useState<Sort>({ key: "points", direction: "desc" })

  const lpRows = useMemo(() => getSortedLpRows(lpTasks, { search: undefined, sort: lpSort } as ListState), [lpTasks, getSortedLpRows, lpSort])
  const voteRows = useMemo(() => getSortedVoteRows(voteTasks, { search: undefined, sort: voteSort } as ListState), [voteTasks, getSortedVoteRows, voteSort])
  const isLp = selectedFeature === "Borrow & LP"
  const next = (s: Sort, key: string): Sort => (s.key === key ? { key, direction: s.direction === "desc" ? "asc" : "desc" } : { key, direction: "desc" })

  return (
    <div className="w-full pb-20 pt-2 font-sans">
      <AirdropHeaderV2
        title="Tasks"
        description="Borrow USG, provide liquidity, and vote for USG and sUSG pools to earn points. Points will be convertible for TAN tokens once the campaign ends."
      />

      <SlidingTabs className="mt-8" labels={["Borrow & LP", "Vote"]} value={selectedFeature} onSwitchTab={(e: string) => setSelectedFeature(e)} />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <label className="flex h-10 min-w-[260px] flex-1 items-center gap-2 rounded-[10px] bg-white/[0.03] px-3.5 ring-1 ring-inset ring-hairline focus-within:ring-action sm:max-w-[360px]">
          <Search className="h-4 w-4 text-ink-3" strokeWidth={2} />
          <input
            value={(isLp ? lpTaskSearchValue : voteTaskSearchValue) ?? ""}
            onChange={(e) => (isLp ? setLpTaskSearchValue(e.target.value) : setVoteTaskSearchValue(e.target.value))}
            placeholder="Search"
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-ink-3"
          />
        </label>
        {isLp && (
          <>
            <SelectMenu label="Type" value={lpTaskType || "All"} options={tasksTypeOptions} onChange={setLpTaskType} allValue="All" />
            <SelectMenu label="Protocol" value={lpTaskProtocol || "All"} options={tasksProtocolOptions} onChange={setLpTaskProtocol} allValue="All" />
            <button
              type="button"
              onClick={() => setLpTaskFilteredBy(lpTaskFilteredBy === "deposits" ? "All" : "deposits")}
              className={cn(
                "h-10 rounded-[10px] px-3.5 text-[13px] font-medium ring-1 ring-inset transition-colors",
                lpTaskFilteredBy === "deposits" ? "bg-white/[0.08] text-white ring-white/15" : "bg-white/[0.03] text-ink-2 ring-hairline hover:text-white"
              )}
            >
              My deposits
            </button>
          </>
        )}
        {!isLp && (
          <SelectMenu label="Protocol" value={voteTaskProtocol || "All"} options={tasksProtocolOptions} onChange={setVoteTaskProtocol} allValue="All" />
        )}
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-hairline bg-surface px-2 pb-3">
        {isLp ? (
          <div className="min-w-[860px]">
            <Head
              cols={LP_GRID}
              headers={lpListHeaders}
              sort={lpSort}
              sortable={["pointRate", "balanceUsd", "points", "status"]}
              onSort={(k) => setLpSort((s) => next(s, k))}
            />
            {(lpRows as LpTask[]).map((t) => (
              <div
                key={t.taskId}
                role="link"
                tabIndex={0}
                onClick={() => window.open(t.url, "_blank", "noopener,noreferrer")}
                onKeyDown={(e) => e.key === "Enter" && window.open(t.url, "_blank", "noopener,noreferrer")}
                className={cn(
                  "grid cursor-pointer items-center gap-4 border-b border-white/[0.06] px-4 py-3.5 transition-colors last:border-b-0 hover:bg-white/[0.035]",
                  LP_GRID
                )}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <LpTaskCustomAssetDisplay token={t.asset.replaceAll("_", "-")} />
                  <span className="flex min-w-0 flex-col items-start gap-1">
                    <span className="truncate text-[14px] font-semibold">{t.description}</span>
                    {t.canZap && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/swap?tokenIn=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&tokenOut=${t.tokenAddress}`)
                        }}
                        className="flex items-center gap-1 text-xs text-action hover:underline"
                      >
                        Zap <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                      </button>
                    )}
                  </span>
                </span>
                <Protocol name={t.protocol} />
                <span className="text-[15px] tabular-nums">{(t.pointRate * 86400).toFixed(0)}</span>
                <span className="text-[15px] tabular-nums">{formatMillions(t.balanceUsd)}</span>
                <span className="text-[15px] font-semibold tabular-nums">{formatMillions(t.points)}</span>
                <StatusDot on={t.status} onLabel="On" offLabel="Off" />
              </div>
            ))}
            {lpRows.length === 0 && <Empty />}
          </div>
        ) : (
          <div className="min-w-[760px]">
            <Head
              cols={VOTE_GRID}
              headers={voteListHeaders}
              sort={voteSort}
              sortable={["pointRate", "points", "lastVote"]}
              onSort={(k) => setVoteSort((s) => next(s, k === "lastVote" ? "lastVotingPower" : k))}
            />
            {(voteRows as VoteTask[]).map((t) => (
              <div
                key={t.taskId}
                role="link"
                tabIndex={0}
                onClick={() => window.open(t.url, "_blank", "noopener,noreferrer")}
                onKeyDown={(e) => e.key === "Enter" && window.open(t.url, "_blank", "noopener,noreferrer")}
                className={cn(
                  "grid cursor-pointer items-center gap-4 border-b border-white/[0.06] px-4 py-3.5 transition-colors last:border-b-0 hover:bg-white/[0.035]",
                  VOTE_GRID
                )}
              >
                <span className="flex min-w-0 items-center gap-3">
                  {t.protocol === "sdcrv.eth" && <TokenImage token="sdCRV" size={32} className="h-8 w-auto shrink-0" />}
                  {t.protocol === "cvx.eth" && <TokenImage token="vlCVX" size={32} className="h-8 w-auto shrink-0" />}
                  {t.protocol === "CRV" && <TokenImage token="veCRV" size={32} className="h-8 w-auto shrink-0" />}
                  <span className="truncate text-[14px] font-semibold">{t.description}</span>
                </span>
                <Protocol name={t.organisation} />
                <span className="text-[15px] tabular-nums">{t.pointRate}</span>
                <span className="text-[15px] font-semibold tabular-nums">{formatMillions(t.points)}</span>
                <span className="text-[15px] tabular-nums">{formatMillions(t.lastVotingPower)}</span>
              </div>
            ))}
            {voteRows.length === 0 && <Empty />}
          </div>
        )}
      </div>
    </div>
  )
}

const LP_GRID = "grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.8fr)]"
const VOTE_GRID = "grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)]"

function Head({
  cols,
  headers,
  sort,
  sortable,
  onSort,
}: {
  cols: string
  headers: { label?: string; key?: unknown }[]
  sort: Sort
  sortable: string[]
  onSort: (key: string) => void
}) {
  return (
    <div className={cn("grid items-center gap-4 px-4 pb-2 pt-4 text-xs text-ink-3", cols)}>
      {headers.map((h) => {
        const key = String(h.key)
        const active = sort.key === key || (key === "lastVote" && sort.key === "lastVotingPower")
        return sortable.includes(key) ? (
          <button
            key={key}
            type="button"
            onClick={() => onSort(key)}
            className={cn("flex w-fit items-center gap-1 text-left", active ? "text-white" : "hover:text-ink-2")}
          >
            {h.label}
            {active && <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", sort.direction === "asc" && "rotate-180")} strokeWidth={2} />}
          </button>
        ) : (
          <span key={key}>{h.label}</span>
        )
      })}
    </div>
  )
}

function Empty() {
  return (
    <div className="px-4 py-14 text-center">
      <div className="text-[15px] font-semibold">No task matches</div>
      <p className="mt-1 text-[13px] text-ink-2">Try another search or filter.</p>
    </div>
  )
}
