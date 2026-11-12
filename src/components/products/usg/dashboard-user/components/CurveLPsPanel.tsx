"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { ListSort } from "@/types"
import { formatDollar } from "@/lib/number_formatter"
import { Button } from "@/components/design_system/inputs/button"
import { MarketAPR } from "@/components/design_system/list/market_apr"
import { MarketListHeader } from "@/components/design_system/list/market_list_header"
import { ListGradientBorder } from "@/components/design_system/list/list_gradient_border"
import { PositionLogo } from "./PositionLogo"
import TokenImageHighlighted from "@/components/design_system/structure/token_image_highlighted"
import { PositionCell } from "./PositionCell"
import { PositionsEmptyState } from "./PositionsEmptyState"
import { PositionsPanelHeader } from "./PositionsPanelHeader"
import { POSITION_HEADER_CLASSNAME, CurveLPHeaderDisposition, SIMPLE_COLUMNS } from "./table_columns"
import { CURVE_LP_HEADERS, sortCurveLPPositions } from "../dashboard_user_controller"
import type { CurveLPPosition } from "../dashboard_user_type"

type CurveLPsPanelProps = {
  positions: CurveLPPosition[]
}

// Curve LPs are managed from the earn page
const LP_ROUTE = "/earn"

export const CurveLPsPanel = ({ positions }: CurveLPsPanelProps) => {
  const [sort, setSort] = useState<ListSort>({ key: "deposited", direction: "desc" })

  const sortedPositions = useMemo(() => sortCurveLPPositions(positions, sort), [positions, sort])

  const totalDeposited = positions.reduce((sum, p) => sum + p.depositedUsd, 0)
  const totalClaimable = positions.reduce((sum, p) => sum + p.claimableUsd, 0)

  const onSort = (key: string) =>
    setSort((prev) => (prev.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "desc" }))

  const onClaim = (position: CurveLPPosition) => window.open(position.claimUrl, "_blank", "noopener,noreferrer")

  return (
    <div className="flex w-full flex-col gap-2.5">
      <PositionsPanelHeader
        title="Curve LPs Staked"
        indicators={[
          { title: "Deposited", value: formatDollar(totalDeposited) },
          { title: "Claimable Rewards", value: formatDollar(totalClaimable) },
        ]}
      />

      {positions.length === 0 ? (
        <PositionsEmptyState message="You have no Curve LP staked yet." action={{ label: "Browse the opportunities", href: LP_ROUTE }} />
      ) : (
        <div className="w-full">
          <MarketListHeader
            className={POSITION_HEADER_CLASSNAME}
            rowDisposition={CurveLPHeaderDisposition}
            headers={CURVE_LP_HEADERS}
            activeSort={sort}
            onSort={onSort}
          />

          {sortedPositions.map((position) => (
            <div key={position.key} className="group relative mt-[3px] w-full">
              <div className="relative bg-white/[0.03] p-[10px] backdrop-blur-[60px] hover-lift-row">
                <Link
                  href={LP_ROUTE}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest(".stop-navigation")) e.preventDefault()
                  }}
                >
                  <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:gap-0">
                    <div className={SIMPLE_COLUMNS.collateral}>
                      <div className="flex min-h-[31px] items-center gap-2 xl:min-h-[53px]">
                        <PositionLogo token={position.logoKey} className="size-[31px] xl:size-[53px]" />

                        <div className="flex items-center gap-2 xl:flex-col xl:items-start xl:gap-0.5">
                          <span className="text-sm font-semibold md:text-[18px]">{position.name.replaceAll("-", "/")}</span>

                          <div className="flex items-center gap-[5px]">
                            {position.rewardTokens.map((token) => (
                              <TokenImageHighlighted key={token} token={token} size={24} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="my-2 w-full opacity-20 xl:hidden" />

                    <div className="w-full xl:flex-1">
                      <MarketAPR
                        poolName={position.name}
                        logoKey={position.logoKey}
                        rewardToken={position.rewardToken}
                        maxLeverage={1}
                        currentAPRDetails={position.currentAPRDetails}
                        projectedAPRDetails={position.projectedAPRDetails}
                        apr={position.apr.current}
                        projectedApr={position.apr.projected}
                        isMarketListDisplay={true}
                      />
                    </div>

                    <PositionCell label="Deposited">{formatDollar(position.depositedUsd, 0)}</PositionCell>

                    <PositionCell label="Claimable">{formatDollar(position.claimableUsd)}</PositionCell>

                    <div className="absolute right-2.5 top-2.5 xl:static xl:flex xl:w-full xl:flex-1 xl:items-center xl:justify-center">
                      <div className="stop-navigation w-[73px]">
                        <Button onClick={() => onClaim(position)} state={position.claimableUsd > 0 ? "active" : "inactive"} classNameChild="!py-1.5">
                          Claim
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              <ListGradientBorder />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
