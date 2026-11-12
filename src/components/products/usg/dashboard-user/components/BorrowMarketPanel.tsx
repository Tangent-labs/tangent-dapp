"use client"

import { toast } from "react-toastify"
import { useMemo, useState } from "react"
import type { ListSort } from "@/types"
import { formatDollar } from "@/lib/number_formatter"
import { ToastComponent, toastTx } from "@/components/design_system/toast"
import { MarketListHeader } from "@/components/design_system/list/market_list_header"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { BorrowPositionRow } from "./BorrowPositionRow"
import { ClaimRewardsModal } from "./ClaimRewardsModal"
import { PositionsEmptyState } from "./PositionsEmptyState"
import { PositionsPanelHeader } from "./PositionsPanelHeader"
import { POSITION_HEADER_CLASSNAME, BorrowHeaderDisposition } from "./table_columns"
import { claimRewards, hasOnChainRows, type ClaimableRow, type ClaimSection } from "../dashboard_user_claim"
import { useUSGDashboardUserContext } from "../dashboard_user_context"
import { BORROW_HEADERS, sortBorrowPositions } from "../dashboard_user_controller"
import type { BorrowPosition } from "../dashboard_user_type"

type BorrowMarketPanelProps = {
  positions: BorrowPosition[]
  usgPrice: number
  // What the claim popup lists: one section per kind of position with something to claim
  claimSections: ClaimSection[]
}

export const BorrowMarketPanel = ({ positions, usgPrice, claimSections }: BorrowMarketPanelProps) => {
  const { walletClient } = useWalletConnexionContext()
  const { reload } = useUSGDashboardUserContext()

  const [sort, setSort] = useState<ListSort>({ key: "deposited", direction: "desc" })
  // Only one calculator is open at a time
  const [openCalculator, setOpenCalculator] = useState<string | null>(null)

  const [isClaimOpen, setIsClaimOpen] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  const sortedPositions = useMemo(() => sortBorrowPositions(positions, sort), [positions, sort])

  const totalDeposited = positions.reduce((sum, p) => sum + p.depositedUsd, 0)
  const totalClaimable = positions.reduce((sum, p) => sum + p.claimableUsd, 0)

  const onSort = (key: string) =>
    setSort((prev) => (prev.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "desc" }))

  const onClaim = async (rows: ClaimableRow[]) => {
    if (hasOnChainRows(rows) && !walletClient) {
      toast.info(ToastComponent, { data: { type: "Notification", content: "Connect your wallet to claim your rewards." } })
      return
    }

    // Only rows claimed on their own page: their pages are opened, there is no transaction to wait for
    if (!hasOnChainRows(rows)) {
      await claimRewards(rows)
      setIsClaimOpen(false)
      return
    }

    setIsClaiming(true)

    try {
      await toastTx(
        claimRewards(rows, walletClient).then(() => undefined),
        {
          pending: { type: "Pending Transaction", content: "Claiming your rewards..." },
          success: () => ({ type: "Success", content: "Your rewards have been claimed." }),
          error: () => ({ type: "Error", content: "The claim transaction failed." }),
        }
      )

      setIsClaimOpen(false)
      reload()
    } catch (error) {
      console.error("User dashboard: claim failed", error)
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-2.5">
      <PositionsPanelHeader
        title="Borrow Market"
        indicators={[
          { title: "Deposited", value: formatDollar(totalDeposited) },
          { title: "Claimable Rewards", value: formatDollar(totalClaimable) },
        ]}
        claim={{ onClick: () => setIsClaimOpen(true), isActive: claimSections.length > 0 }}
      />

      {positions.length === 0 ? (
        <PositionsEmptyState message="You have no borrow position yet." action={{ label: "Browse the markets", href: "/" }} />
      ) : (
        <div className="w-full">
          <MarketListHeader
            className={POSITION_HEADER_CLASSNAME}
            rowDisposition={BorrowHeaderDisposition}
            headers={BORROW_HEADERS}
            activeSort={sort}
            onSort={onSort}
          />

          {sortedPositions.map((position) => (
            <BorrowPositionRow
              key={position.marketAddress}
              position={position}
              usgPrice={usgPrice}
              isCalculatorOpen={openCalculator === position.marketAddress}
              onToggleCalculator={() => setOpenCalculator((prev) => (prev === position.marketAddress ? null : position.marketAddress))}
            />
          ))}
        </div>
      )}

      <ClaimRewardsModal open={isClaimOpen} onOpenChange={setIsClaimOpen} sections={claimSections} isClaiming={isClaiming} onClaim={onClaim} />
    </div>
  )
}
