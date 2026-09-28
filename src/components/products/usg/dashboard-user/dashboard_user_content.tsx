"use client"

import { useEffect, useMemo, useState } from "react"
import { Separator } from "./components/Separator"
import { getClaimSections } from "./dashboard_user_claim"
import { getDashboardSummary } from "./dashboard_user_summary"
import { EarningsCard } from "./components/EarningsCard"
import { PositionTabs } from "./components/PositionTabs"
import type { PositionTabKey } from "./dashboard_user_type"
import { BorrowMarketPanel } from "./components/BorrowMarketPanel"
import { UserProfileSummary } from "./components/UserProfileSummary"
import { useUSGDashboardUserContext } from "./dashboard_user_context"
import { SUSGPanel } from "./components/SUSGPanel"
import { CurveLPsPanel } from "./components/CurveLPsPanel"
import { PortfolioAllocationCard } from "./components/PortfolioAllocationCard"

export const USGDashboardUserContent = () => {
  const { data, isLoading, error, isWalletConnected } = useUSGDashboardUserContext()

  const [activeTab, setActiveTab] = useState<PositionTabKey>("borrow")

  // Keeps the scrollbar space even when a tab is short: switching tabs never shifts the page sideways
  useEffect(() => {
    document.documentElement.style.scrollbarGutter = "stable"
    return () => {
      document.documentElement.style.scrollbarGutter = ""
    }
  }, [])

  const summary = useMemo(() => (data ? getDashboardSummary(data) : null), [data])
  const claimSections = useMemo(() => (data ? getClaimSections(data) : []), [data])

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-5 py-5">
        <div className="shimmer h-[80px] w-full rounded-lg bg-overlay-panel" />
        <div className="shimmer h-[263px] w-full rounded-lg bg-overlay-panel" />
      </div>
    )
  }

  if (error || !data || !summary) {
    return <div className="w-full py-5 text-center text-sm text-subtitle">{error ?? "No data available"}</div>
  }

  return (
    <div className="flex w-full select-none flex-col items-start justify-start gap-5 py-5">
      <UserProfileSummary address={data.address} summary={summary} isWalletConnected={isWalletConnected} />

      <Separator />

      <div className="flex w-full flex-col gap-5 xl:flex-row">
        <EarningsCard lines={summary.earnings} />
        <PortfolioAllocationCard items={summary.allocation} />
      </div>

      <Separator />

      <PositionTabs value={activeTab} onChange={setActiveTab} />

      {activeTab === "borrow" && <BorrowMarketPanel positions={data.borrowPositions} usgPrice={data.usgPrice} claimSections={claimSections} />}
      {activeTab === "curve-lps" && <CurveLPsPanel positions={data.curveLPPositions} />}
      {activeTab === "susg" && <SUSGPanel position={data.susgPosition} />}
    </div>
  )
}
