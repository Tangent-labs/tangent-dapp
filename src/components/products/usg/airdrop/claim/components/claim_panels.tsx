"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import {
  AIRDROP_CATEGORIES,
  AIRDROP_SNAPSHOT_DATE,
  AirdropCategoryAllocation,
  AirdropCategoryDistribution,
  AirdropCategoryId,
  AirdropTile,
  formatTan,
  splitInColumns,
} from "../usg_claim_airdrop_controller"

function Tile({ tile }: { tile: AirdropTile }) {
  return (
    <div className="flex h-[54px] min-w-0 flex-col items-start justify-center gap-0.5 rounded-[10px] bg-white/[0.03] px-3 py-2 backdrop-blur-[30px]">
      <span className="truncate text-xs text-subtitle">{tile.label}</span>
      <div className="flex items-baseline gap-[5px] whitespace-nowrap">
        <span className="text-[15px] font-semibold text-white">{tile.value}</span>
        {tile.unit && <span className="text-xs text-subtitle">{tile.unit}</span>}
      </div>
    </div>
  )
}

function Tiles({ tiles, columns = 3 }: { tiles: AirdropTile[]; columns?: 2 | 3 }) {
  return (
    <div className={cn("grid w-full grid-cols-1 gap-x-2.5 gap-y-2 sm:grid-cols-2", columns === 3 && "md:grid-cols-3")}>
      {tiles.map((tile) => (
        <Tile key={tile.label} tile={tile} />
      ))}
    </div>
  )
}

type CategoryPanelProps = {
  id: AirdropCategoryId
  amountLabel: string
  amount: number
  children: ReactNode
}

function CategoryPanel({ id, amountLabel, amount, children }: CategoryPanelProps) {
  const { label, color } = AIRDROP_CATEGORIES[id]

  return (
    <ReliefCard className="flex w-full flex-col gap-3 px-5 pb-5 pt-3.5">
      <div className="flex w-full flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="size-2 shrink-0 rounded-full" style={{ background: color }} />
          <span className="text-xl font-semibold text-white">{label}</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="text-sm text-subtitle">{amountLabel}</span>
          <span className="text-xl font-semibold text-white">{formatTan(amount)}</span>
          <span className="text-sm text-subtitle">TAN</span>
        </div>
      </div>

      <div className="h-px w-full bg-white/10" />

      {children}
    </ReliefCard>
  )
}

function TwoColumns({ panels }: { panels: ReactNode[] }) {
  if (panels.length <= 1) return <div className="w-full">{panels}</div>

  const [left, right] = splitInColumns(panels)

  return (
    <div className="grid w-full grid-cols-1 items-start gap-[15px] lg:grid-cols-2">
      <div className="flex flex-col gap-[15px]">{left}</div>
      <div className="flex flex-col gap-[15px]">{right}</div>
    </div>
  )
}

type ClaimDetailsProps = {
  allocations: AirdropCategoryAllocation[]
  isClaimed: boolean
}

/** Allocation details of the connected wallet, one panel per category with an allocation */
export function ClaimDetails({ allocations, isClaimed }: ClaimDetailsProps) {
  const panels = allocations
    .filter((allocation) => allocation.amount > 0)
    .map((allocation) => (
      <CategoryPanel key={allocation.id} id={allocation.id} amountLabel={isClaimed ? "Claimed" : "Claimable"} amount={allocation.amount}>
        <div className="flex w-full flex-col gap-5">
          {allocation.sections.map((section) => (
            <div key={section.title} className="flex w-full flex-col gap-2">
              <div className="flex w-full items-baseline gap-2 whitespace-nowrap">
                <span className="text-sm font-semibold text-white">{section.title}</span>
                {section.pool !== undefined && <span className="text-xs text-subtitle">Pool {formatTan(section.pool)} TAN</span>}
                <div className="flex-1" />
                <span className="text-sm font-semibold text-white">{formatTan(section.amount)}</span>
                <span className="text-xs text-subtitle">TAN</span>
              </div>
              <Tiles tiles={section.tiles} />
            </div>
          ))}
        </div>
      </CategoryPanel>
    ))

  return <TwoColumns panels={panels} />
}

/** Global distribution of the airdrop pools, displayed when the wallet has no allocation */
export function AirdropDistribution({ distribution }: { distribution: AirdropCategoryDistribution[] }) {
  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-0.5">
        <span className="text-xl font-semibold text-white">Airdrop distribution</span>
        <span className="text-sm text-subtitle">TAN pools by category. Snapshot of {AIRDROP_SNAPSHOT_DATE}.</span>
      </div>

      <TwoColumns
        panels={distribution.map((category) => (
          <CategoryPanel key={category.id} id={category.id} amountLabel="Pool" amount={category.pool}>
            <Tiles tiles={category.tiles} columns={category.tiles.length > 2 ? 3 : 2} />
          </CategoryPanel>
        ))}
      />
    </div>
  )
}
