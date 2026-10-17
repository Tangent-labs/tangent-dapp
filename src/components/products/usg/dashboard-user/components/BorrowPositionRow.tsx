"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Calculator, CircleChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDollar, formatNumber } from "@/lib/number_formatter"
import { MarketAPR } from "@/components/design_system/list/market_apr"
import { ListGradientBorder } from "@/components/design_system/list/list_gradient_border"
import { PositionLogo } from "./PositionLogo"
import { CollateralEmissionLabel } from "@/components/design_system/list/collat_emission_label"
import TokenImageHighlighted from "@/components/design_system/structure/token_image_highlighted"
import { PositionCalculator } from "./PositionCalculator"
import { PositionCell } from "./PositionCell"
import { BORROW_COLUMNS } from "./table_columns"
import { getHealthColor, getPositionRoute } from "../dashboard_user_controller"
import { CalculatorInputs, computePositionMetrics, getDefaultInputs, getInputsFromSimulation, loadSimulation } from "../dashboard_user_calculator"
import type { BorrowPosition } from "../dashboard_user_type"

type BorrowPositionRowProps = {
  position: BorrowPosition
  usgPrice: number
  isCalculatorOpen: boolean
  onToggleCalculator: () => void
}

export const BorrowPositionRow = ({ position, usgPrice, isCalculatorOpen, onToggleCalculator }: BorrowPositionRowProps) => {
  // Simulation saved by the user (shared with the calculator of the market page)
  const [inputs, setInputs] = useState<CalculatorInputs>(() => getDefaultInputs(position))
  const [hasSimulation, setHasSimulation] = useState(false)

  useEffect(() => {
    const saved = loadSimulation(position.marketAddress)
    if (saved) {
      setInputs(getInputsFromSimulation(position, saved))
      setHasSimulation(true)
    }
  }, [position])

  const netVAPR = useMemo(
    () => (hasSimulation ? computePositionMetrics(position, inputs, usgPrice).netVAPR : null),
    [hasSimulation, position, inputs, usgPrice]
  )

  return (
    <div className="group relative mt-[3px] w-full">
      <div className={cn("relative bg-white/[0.03] p-[10px] backdrop-blur-[60px] hover-lift-row", isCalculatorOpen && "before:bg-list-row-hover")}>
        <Link
          href={getPositionRoute(position.marketAddress)}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest(".stop-navigation")) e.preventDefault()
          }}
        >
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:gap-0">
            {/* Collateral */}
            <div className={BORROW_COLUMNS.collateral}>
              <div className="flex items-center gap-2 xl:min-h-[53px]">
                <PositionLogo token={position.logoKey} />

                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-semibold md:text-[18px]">{position.name.replaceAll("-", "/")}</span>

                  <div className="flex items-center gap-[5px]">
                    {position.rewardTokens.map((token) => (
                      <TokenImageHighlighted key={token} token={token} size={24} />
                    ))}
                    <CollateralEmissionLabel isHEC={position.marketKind === "HEC"} isFixedRate={position.marketKind === "FIR"} />
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-1 w-full opacity-20 xl:hidden" />

            <PositionCell label="Deposited" className={BORROW_COLUMNS.deposited}>
              {formatDollar(position.depositedUsd, 0)}
            </PositionCell>

            <PositionCell label="Debt">{formatNumber(position.debt, 0)}</PositionCell>

            <PositionCell label="Health">
              <span style={{ color: getHealthColor(position.health) }}>{position.health === null ? "-" : position.health.toFixed(2)}</span>
            </PositionCell>

            <PositionCell label="Claimable">{formatDollar(position.claimableUsd)}</PositionCell>

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

            <PositionCell label="Borrow Rate">{position.borrowRate.toFixed(2)}%</PositionCell>

            <PositionCell label="Net vAPR">
              <span className="flex items-center gap-2">
                {netVAPR === null ? "-%" : `${netVAPR.toFixed(2)}%`}

                <button
                  type="button"
                  aria-label={isCalculatorOpen ? "Close the vAPR calculator" : "Open the vAPR calculator"}
                  aria-expanded={isCalculatorOpen}
                  onClick={onToggleCalculator}
                  className={cn(
                    "stop-navigation flex size-6 items-center justify-center rounded-full transition-colors hover:bg-white/10",
                    isCalculatorOpen ? "text-white" : "text-white/70"
                  )}
                >
                  <Calculator className="size-3.5" />
                </button>
              </span>
            </PositionCell>

            <div className={BORROW_COLUMNS.action}>
              <CircleChevronRight className="size-[15px] text-white/70 transition-colors group-hover:text-white" />
            </div>
          </div>
        </Link>
      </div>

      <ListGradientBorder />

      <AnimatePresence initial={false}>
        {isCalculatorOpen && (
          <motion.div
            key="calculator"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-[#101010]"
          >
            <PositionCalculator
              position={position}
              usgPrice={usgPrice}
              initialInputs={inputs}
              onSaved={(saved) => {
                setInputs(saved)
                setHasSimulation(true)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
