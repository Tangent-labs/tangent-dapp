"use client"

import Link from "next/link"
import { formatDollar } from "@/lib/number_formatter"
import { AprIndicator } from "@/components/design_system/list/apr_indicator"
import { MarketListHeader } from "@/components/design_system/list/market_list_header"
import { ListGradientBorder } from "@/components/design_system/list/list_gradient_border"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { PositionCell } from "./PositionCell"
import { PositionsEmptyState } from "./PositionsEmptyState"
import { PositionsPanelHeader } from "./PositionsPanelHeader"
import { POSITION_HEADER_CLASSNAME, SIMPLE_COLUMNS, SUSGHeaderDisposition } from "./table_columns"
import { SUSG_HEADERS } from "../dashboard_user_controller"
import type { SUSGPosition } from "../dashboard_user_type"

type SUSGPanelProps = {
  position: SUSGPosition | null
}

// sUSG is managed from the savings page
const SUSG_ROUTE = "/stake"

export const SUSGPanel = ({ position }: SUSGPanelProps) => (
  <div className="flex w-full flex-col gap-2.5">
    <PositionsPanelHeader
      title="sUSG"
      indicators={[
        { title: "Deposited", value: formatDollar(position?.depositedUsd ?? 0) },
        { title: "Balance", value: formatDollar(position?.balanceUsd ?? 0) },
      ]}
    />

    {!position ? (
      <PositionsEmptyState message="You do not hold any sUSG yet." action={{ label: "Go to the savings account", href: SUSG_ROUTE }} />
    ) : (
      <div className="w-full">
        <MarketListHeader className={POSITION_HEADER_CLASSNAME} rowDisposition={SUSGHeaderDisposition} headers={SUSG_HEADERS} />

        <div className="group relative mt-[3px] w-full">
          <div className="relative bg-white/[0.03] p-[10px] backdrop-blur-[60px] hover-lift-row">
            <Link href={SUSG_ROUTE}>
              <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:gap-0">
                <div className={SIMPLE_COLUMNS.collateral}>
                  <div className="flex min-h-[45px] items-center gap-2 xl:min-h-[53px]">
                    {/* Same visual size as one circle of the pair icons of the other tables */}
                    <div className="flex w-5 justify-center md:w-[53px]">
                      <TokenImage token="sUSG" size={32} className="size-5 md:size-[31px]" />
                    </div>
                    <span className="text-sm font-semibold md:text-[18px]">sUSG</span>
                  </div>
                </div>

                <hr className="my-1 w-full opacity-20 xl:hidden" />

                <PositionCell label="APY">
                  <AprIndicator isMax={false}>
                    <div>{position.apy.toFixed(2)}%</div>

                    <div className="flex min-w-40 items-center justify-between gap-2 p-2 text-xs">
                      <span className="font-semibold">Current APY</span>
                      <span>{position.apy.toFixed(2)}%</span>
                    </div>
                  </AprIndicator>
                </PositionCell>

                <PositionCell label="Deposited">{formatDollar(position.depositedUsd, 0)}</PositionCell>

                <PositionCell label="Balance">{formatDollar(position.balanceUsd, 0)}</PositionCell>
              </div>
            </Link>
          </div>

          <ListGradientBorder />
        </div>
      </div>
    )}
  </div>
)
