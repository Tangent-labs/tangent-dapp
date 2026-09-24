"use client"

import { useState } from "react"
import { ChevronDown, X } from "lucide-react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { formatDollar } from "@/lib/number_formatter"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogPortal } from "@/components/ui/dialog"
import { Button } from "@/components/design_system/inputs/button"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { USGHoverCard } from "@/components/design_system/structure/usg_hover_card"
import { NeonLightCard } from "@/components/design_system/structure/neon_light_card"
import { PositionLogo } from "./PositionLogo"
import { CollateralEmissionLabel } from "@/components/design_system/list/collat_emission_label"
import TokenImageHighlighted from "@/components/design_system/structure/token_image_highlighted"
import { BLUE_GLOW } from "../dashboard_user_glow"
import { getRewardTotals, isSelectedByDefault, type ClaimableRow, type ClaimSection } from "../dashboard_user_claim"

type ClaimRewardsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sections: ClaimSection[]
  isClaiming: boolean
  onClaim: (rows: ClaimableRow[]) => void
}

type ContentProps = Pick<ClaimRewardsModalProps, "sections" | "isClaiming" | "onClaim">

const ClaimRewardsContent = ({ sections, isClaiming, onClaim }: ContentProps) => {
  const allRows = sections.flatMap((section) => section.rows)

  // The rows claimed on-chain are selected when the popup opens (the content is mounted on open)
  const [selected, setSelected] = useState<Set<string>>(() => new Set(allRows.filter(isSelectedByDefault).map((row) => row.id)))
  // A section with nothing selected by default (Curve LPs, claimed on their own page) starts folded
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(sections.filter((section) => !section.rows.some(isSelectedByDefault)).map((section) => section.key))
  )

  const selectedRows = allRows.filter((row) => selected.has(row.id))
  // The tokens of the strip never change (only their amounts), so nothing moves when a position is (un)selected
  const selectedTotals = new Map(getRewardTotals(selectedRows).map(({ token, usd }) => [token, usd]))
  const rewardTotals = getRewardTotals(allRows).map(({ token }) => ({ token, usd: selectedTotals.get(token) ?? 0 }))

  const toggleRow = (id: string, isOn: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (isOn) next.add(id)
      else next.delete(id)
      return next
    })

  const toggleSection = (section: ClaimSection, isOn: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      section.rows.forEach((row) => (isOn ? next.add(row.id) : next.delete(row.id)))
      return next
    })

  const toggleCollapsed = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <ReliefCard className="p-5">
      <div className="flex animate-content-in flex-col gap-5 group-data-[state=closed]:animate-content-out">
        {/* Title */}
        <div className="flex items-start justify-between">
          <DialogPrimitive.Title className="text-[24px] font-semibold">Claim rewards</DialogPrimitive.Title>

          <DialogPrimitive.Close aria-label="Close" className="p-1 text-white/70 transition-colors hover:text-white">
            <X className="size-3.5" />
          </DialogPrimitive.Close>
        </div>

        {/* What will be received, per reward token */}
        <NeonLightCard paddingHorizontal={5} className="flex w-full" color1="rgba(0,117,255,0)" color2="#0075FF">
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-lg" style={{ background: BLUE_GLOW }} />

          <div className="relative flex min-h-[60px] w-full items-stretch overflow-x-auto">
            {rewardTotals.map(({ token, usd }, index) => (
              <div
                key={token}
                className={cn(
                  "relative flex min-w-[150px] flex-1 items-center justify-center gap-2.5 px-2.5",
                  index > 0 && "before:absolute before:left-0 before:top-1/2 before:h-10 before:w-px before:-translate-y-1/2 before:bg-white/10"
                )}
              >
                {/* The whole logo is shown (not cropped in a circle) */}
                <TokenImage token={token} size={32} className="size-8 shrink-0 object-contain" />

                <div className="flex min-w-[72px] flex-col items-start gap-0.5">
                  <span className="flex items-center gap-0.5 text-xs text-subtitle">
                    {token}
                    <USGHoverCard title={token} iconClassName="w-[11px] fill-subtitle">
                      Rewards in {token} that you receive by claiming the selected positions.
                    </USGHoverCard>
                  </span>
                  <span className={cn("text-sm font-semibold transition-colors", usd === 0 && "text-white/40")}>{formatDollar(usd)}</span>
                </div>
              </div>
            ))}
          </div>
        </NeonLightCard>

        {/* Sections */}
        {sections.map((section) => {
          const isCollapsed = collapsed.has(section.key)
          const total = section.rows.reduce((sum, row) => sum + row.claimableUsd, 0)
          const isAllSelected = section.rows.length > 0 && section.rows.every((row) => selected.has(row.id))

          return (
            <div key={section.key} className="flex flex-col gap-5">
              <div className="flex items-center justify-between pl-2.5 pr-5">
                <button type="button" onClick={() => toggleCollapsed(section.key)} aria-expanded={!isCollapsed} className="flex items-center gap-2.5">
                  <ChevronDown className={cn("size-4 transition-transform duration-200", isCollapsed && "-rotate-90")} />
                  <span className="text-[24px] font-semibold">{section.label}</span>
                </button>

                <div className="flex items-center gap-[25px]">
                  <div className="flex w-[110px] flex-col items-end">
                    <span className="text-xs text-subtitle">Claimable</span>
                    <span className="text-sm font-semibold">{formatDollar(total)}</span>
                  </div>

                  <Switch checked={isAllSelected} onCheckedChange={(isOn) => toggleSection(section, isOn)} aria-label={`Select all ${section.label}`} />
                </div>
              </div>

              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {/* Same columns as the rows: everything on the right is right-aligned (amount column, then the switch) */}
                    <div className="flex h-10 items-center justify-between gap-2 rounded-t-[10px] bg-overlay-panel pl-2.5 pr-5 text-sm">
                      <span>Product</span>

                      <div className="flex shrink-0 items-center gap-[25px]">
                        <span className="w-[110px] text-right">Claimable</span>
                        <span aria-hidden className="w-[38px]" />
                      </div>
                    </div>

                    {section.rows.map((row) => (
                      <div key={row.id} className="mt-[3px] flex items-center justify-between gap-2 bg-overlay-panel py-2.5 pl-2.5 pr-5">
                        <div className="flex min-w-0 items-center gap-2">
                          <PositionLogo token={row.logoKey} />

                          <div className="flex min-w-0 flex-col items-start gap-0.5">
                            <span className="truncate text-sm font-semibold md:text-[18px]">{row.name.replaceAll("-", "/")}</span>

                            <div className="flex items-center gap-[5px]">
                              {row.rewardTokens.map((token) => (
                                <TokenImageHighlighted key={token} token={token} size={24} />
                              ))}
                              {row.marketKind && <CollateralEmissionLabel isHEC={row.marketKind === "HEC"} isFixedRate={row.marketKind === "FIR"} />}
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-[25px]">
                          <span className="w-[110px] text-right text-[15px] font-light">{formatDollar(row.claimableUsd)}</span>

                          <Switch checked={selected.has(row.id)} onCheckedChange={(isOn) => toggleRow(row.id, isOn)} aria-label={`Claim ${row.name}`} />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        <Button
          onClick={() => onClaim(selectedRows)}
          state={selectedRows.length > 0 && !isClaiming ? "active" : "inactive"}
          hasLoadingState
          isLoading={isClaiming}
        >
          Claim
        </Button>
      </div>
    </ReliefCard>
  )
}

// Popup in the middle of the screen, the page behind it is blurred and darkened
export const ClaimRewardsModal = ({ open, onOpenChange, ...contentProps }: ClaimRewardsModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogPortal>
      {/* A bit bigger than the screen: the blur has no edge artifact */}
      <DialogPrimitive.Overlay className="fixed -inset-10 z-50 bg-black/60 backdrop-blur-[10px] data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in" />

      <DialogPrimitive.Content
        aria-describedby={undefined}
        className="scrollbar-thin group fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-32px)] w-[calc(100vw-32px)] max-w-[728px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[10px] outline-none [scrollbar-color:#fff_rgba(255,255,255,0.1)] [scrollbar-width:thin] data-[state=closed]:animate-modal-out data-[state=open]:animate-modal-in [&::-webkit-scrollbar-button]:hidden"
      >
        <ClaimRewardsContent {...contentProps} />
      </DialogPrimitive.Content>
    </DialogPortal>
  </Dialog>
)
