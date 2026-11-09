"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { IconTan } from "@/components/icons"
import { SecondaryButton } from "@/components/design_system/inputs/secondary_button"
import { GhostButton } from "./claim_buttons"
import { ClaimStatus } from "../usg_claim_airdrop_context"
import { AIRDROP_CATEGORIES, AirdropCategoryAllocation, formatShare, formatTan, shortenAddress } from "../usg_claim_airdrop_controller"

const CLAIMED_COLOR = AIRDROP_CATEGORIES.pointCampaign.color
const CLAIMED_GLOW = AIRDROP_CATEGORIES.pointCampaign.glow

// Claim is not live yet: flip to true to enable the "Claim all" button
const CLAIM_ENABLED = false

type RecapCardShellProps = {
  pill: string
  color: string
  glow: string
  className?: string
  children: ReactNode
}

function RecapCardShell({ pill, color, glow, className, children }: RecapCardShellProps) {
  return (
    <div className={cn("relative pt-2.5", className)}>
      <div className="absolute left-0 top-0 z-20 flex w-full justify-center">
        <div style={{ background: color }} className="rounded-[10px] border border-white/10 px-[19px] py-[3px] text-[10px] font-semibold text-black">
          {pill}
        </div>
      </div>

      {/* Same neon border as NeonLightCard, with the flatter bottom glow of the claim airdrop design */}
      <div
        className="relative flex h-[176px] w-full flex-col items-center justify-between overflow-hidden rounded-[10px] px-4 pb-4 pt-6 backdrop-blur-[30px]"
        style={{
          background: `radial-gradient(54% 13% at 50% 100%, ${glow} 0%, rgba(0, 0, 0, 0) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03))`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-[10px]"
          style={{
            padding: "1px",
            background: `radial-gradient(49.97% 49.97% at 50.03% 100%, #FFFFFF 0%, ${color} 19.71%, rgba(0, 0, 0, 0) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%, rgba(255, 255, 255, 0.1) 100%)`,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
        {children}
      </div>
    </div>
  )
}

function TanAmount({ amount, decimals }: { amount: number; decimals?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <IconTan className="size-[22px] shrink-0" />
      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-[26px] font-semibold text-white">{decimals && amount === 0 ? "0.00" : formatTan(amount)}</span>
        <span className="text-sm text-subtitle">TAN</span>
      </div>
    </div>
  )
}

type TotalRecapCardProps = {
  totalAmount: number
  address?: string
  claimStatus: ClaimStatus
  onClaim: () => void
}

function TotalRecapCard({ totalAmount, address, claimStatus, onClaim }: TotalRecapCardProps) {
  const hasAllocation = totalAmount > 0
  const isClaimed = claimStatus === "claimed"

  const label = { idle: "Total claimable", claiming: "Claiming", claimed: "Claimed" }[claimStatus]
  const sub = claimStatus === "claiming" ? "Confirm in your wallet" : `Wallet ${shortenAddress(address)}`

  return (
    <RecapCardShell pill="Total" color={isClaimed ? CLAIMED_COLOR : "#FFFFFF"} glow={isClaimed ? CLAIMED_GLOW : "#ffffff80"}>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-subtitle">{label}</span>
        <TanAmount amount={totalAmount} decimals />
        <span className="text-xs text-subtitle">{sub}</span>
      </div>

      {!hasAllocation && (
        <GhostButton disabled className="w-[132px]">
          Nothing to claim
        </GhostButton>
      )}

      {hasAllocation && claimStatus === "idle" && (
        <SecondaryButton
          onClick={onClaim}
          state={CLAIM_ENABLED ? "active" : "disabled"}
          disabled={!CLAIM_ENABLED}
          className="h-[30px] w-[132px] justify-center text-xs disabled:opacity-40"
        >
          Claim all
        </SecondaryButton>
      )}

      {hasAllocation && claimStatus === "claiming" && (
        <GhostButton disabled className="w-[132px]">
          Claiming...
        </GhostButton>
      )}

      {hasAllocation && isClaimed && (
        <GhostButton disabled className="w-[132px] text-white">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2.5 6.25L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Claimed
        </GhostButton>
      )}
    </RecapCardShell>
  )
}

type CategoryRecapCardProps = {
  allocation: AirdropCategoryAllocation
  totalAmount: number
  claimStatus: ClaimStatus
}

function CategoryRecapCard({ allocation, totalAmount, claimStatus }: CategoryRecapCardProps) {
  const { label, color, glow } = AIRDROP_CATEGORIES[allocation.id]

  if (allocation.amount <= 0) {
    return (
      <RecapCardShell pill={label} color={color} glow={glow} className="opacity-45">
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm text-subtitle">Not eligible</span>
          <span className="text-[26px] font-semibold text-white">0</span>
          <span className="text-xs text-[rgba(155,155,155,0.7)]">No allocation</span>
        </div>
      </RecapCardShell>
    )
  }

  const ratio = totalAmount > 0 ? allocation.amount / totalAmount : 0

  return (
    <RecapCardShell pill={label} color={color} glow={glow}>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-subtitle">{claimStatus === "claimed" ? "Claimed" : "Claimable"}</span>
        <TanAmount amount={allocation.amount} />
        <div className="flex flex-col items-center gap-1.5 pt-1.5">
          <div className="relative h-1 w-[180px] overflow-hidden rounded bg-white/[0.08]">
            <div className="absolute left-0 top-0 h-1" style={{ width: `${Math.min(ratio, 1) * 100}%`, background: color }} />
          </div>
          <span className="text-xs text-subtitle">{formatShare(ratio)} of your total</span>
        </div>
        <span className="text-xs text-[rgba(155,155,155,0.7)]">{allocation.sources.join(", ")}</span>
      </div>
    </RecapCardShell>
  )
}

type ClaimRecapProps = {
  allocations: AirdropCategoryAllocation[]
  totalAmount: number
  address?: string
  claimStatus: ClaimStatus
  onClaim: () => void
}

export function ClaimRecap({ allocations, totalAmount, address, claimStatus, onClaim }: ClaimRecapProps) {
  return (
    <div className="grid w-full grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <TotalRecapCard totalAmount={totalAmount} address={address} claimStatus={claimStatus} onClaim={onClaim} />
      {allocations.map((allocation) => (
        <CategoryRecapCard key={allocation.id} allocation={allocation} totalAmount={totalAmount} claimStatus={claimStatus} />
      ))}
    </div>
  )
}
