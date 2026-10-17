"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { useClipboard } from "@/hooks/useClipboard"
import { formatAddress } from "@/lib/other_formatter"
import { formatDollar, formatNumber } from "@/lib/number_formatter"
import { IconCopyPaste } from "@/components/icons/icon_copy_paste"
import { IconOpenOutside } from "@/components/icons/icon_open_outside"
import { WalletAvatar } from "@/components/design_system/structure/wallet_avatar"
import { Button } from "@/components/design_system/inputs/button"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { NeonLightCard } from "@/components/design_system/structure/neon_light_card"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { BLUE_GLOW } from "../dashboard_user_glow"
import type { DashboardSummary } from "../dashboard_user_summary"

type UserProfileSummaryProps = {
  address: string
  summary: DashboardSummary
  isWalletConnected: boolean
}

type StatProps = {
  title: string
  // Thin vertical line on its left (desktop), like in the design
  hasDivider?: boolean
  value: React.ReactNode
  subValue?: React.ReactNode
}

// Desktop: label above the value, centered. Mobile: one row per total, label left and value right
const Stat = ({ title, hasDivider, value, subValue }: StatProps) => (
  <div
    className={cn(
      "relative flex w-full items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0 lg:flex-col lg:justify-center lg:gap-0 lg:p-0",
      hasDivider && "lg:before:absolute lg:before:left-0 lg:before:top-1/2 lg:before:h-10 lg:before:w-px lg:before:-translate-y-1/2 lg:before:bg-white/10"
    )}
  >
    <span className="text-xs text-subtitle">{title}</span>

    <div className="flex flex-row-reverse items-center gap-2 lg:flex-col lg:gap-0">
      <span className="flex items-center gap-[5px] text-sm font-semibold text-white">{value}</span>
      {subValue && <span className="text-xs text-subtitle">{subValue}</span>}
    </div>
  </div>
)

export const UserProfileSummary = ({ address, summary, isWalletConnected }: UserProfileSummaryProps) => {
  const { copied, copy } = useClipboard()
  const { connect } = useWalletConnexionContext()

  return (
    <div className="flex w-full flex-col gap-5 lg:flex-row">
      {/* Profile */}
      <ReliefCard className="flex shrink-0 items-center justify-center gap-2.5 p-2.5 lg:w-[225px] lg:justify-start">
        {isWalletConnected ? (
          <>
            <WalletAvatar address={address} />

            <div className="flex min-w-0 flex-col gap-[5px]">
              <span className="truncate text-lg font-semibold">{formatAddress(address)}</span>

              <div className="flex items-center gap-[5px] text-white/70">
                <button type="button" onClick={() => copy(address)} aria-label="Copy address" title={copied ? "Copied" : "Copy address"}>
                  <IconCopyPaste className={`size-[15px] transition-colors ${copied ? "fill-success" : "fill-current hover:fill-white"}`} />
                </button>

                <Link href={`https://etherscan.io/address/${address}`} target="_blank" rel="noopener noreferrer" aria-label="Open on Etherscan">
                  <IconOpenOutside className="size-[15px] opacity-70 hover:opacity-100" />
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Grey placeholders until a wallet is connected */}
            <div aria-hidden className="size-[60px] shrink-0 rounded-lg bg-overlay-panel shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" />

            <div className="flex min-w-0 flex-col items-start gap-[5px]">
              <span className="truncate text-lg font-semibold text-white/40">Not connected</span>

              <div className="w-[130px]">
                <Button onClick={connect} classNameChild="!py-1 !text-xs">
                  Connect wallet
                </Button>
              </div>
            </div>
          </>
        )}
      </ReliefCard>

      {/* Totals */}
      <NeonLightCard paddingHorizontal={2.5} className="flex flex-1" color1="rgba(0,117,255,0)" color2="#0075FF">
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-lg" style={{ background: BLUE_GLOW }} />

        <div className="relative flex h-full w-full flex-col divide-y divide-white/10 lg:grid lg:grid-cols-5 lg:items-center lg:divide-y-0">
          <Stat title="Total Deposited" value={formatDollar(summary.totalDeposited, 0)} />
          <Stat hasDivider title="Total Debt" value={formatDollar(summary.totalDebt, 0)} />
          <Stat hasDivider title="Total held in LPs" value={formatDollar(summary.totalHeldInLPs, 0)} />
          <Stat
            hasDivider
            title="Total sUSG"
            value={
              <>
                {formatNumber(summary.totalSUSG, 0)}
                <TokenImage token="sUSG" size={16} className="size-[15px] rounded-full" />
              </>
            }
            subValue={formatDollar(summary.totalSUSGUsd, 0)}
          />
          <Stat hasDivider title="Total claimable" value={formatDollar(summary.totalClaimable, 0)} />
        </div>
      </NeonLightCard>
    </div>
  )
}
