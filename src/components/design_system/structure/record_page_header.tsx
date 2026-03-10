import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { IconCircleHelp } from "@/components/icons"
import { MarketListAPR } from "../list/market_list_apr"
import { MarketAPR, USGMarketType } from "@/components/products/usg/usg_type"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type RecordPageHeaderProps = {
  maxLTV: number
  apr?: MarketAPR
  indicators?: RecordPageHeaderIndicatorProps[]
  poolName: string
  marketType: USGMarketType | undefined
  rewardToken: string
  currentAPRDetails:
    | {
        [rewardToken: string]: number
      }
    | undefined
  projectedAPRDetails:
    | {
        [rewardToken: string]: number
      }
    | undefined
}

export function RecordPageHeader({
  apr,
  indicators,
  maxLTV,
  poolName,
  rewardToken,
  currentAPRDetails,
  projectedAPRDetails,
  marketType,
}: RecordPageHeaderProps) {
  let totalCurrentAPR = 0
  let totalProjectedAPR = 0

  const hasZeroApr = !!apr?.currentAPR && Object.values(apr?.currentAPR)?.some((v) => Number(v) === 0)

  if (apr && apr?.currentAPR && apr?.projectedAPR) {
    totalProjectedAPR = Object.values(apr?.projectedAPR).reduce((sum, value) => Number(sum) + Number(value), 0) as number
    totalCurrentAPR = Object.values(apr?.currentAPR).reduce((sum, value) => Number(sum) + Number(value), 0) as number
  }

  const maxLeverage = 1 / (1 - maxLTV)

  return (
    <>
      <div className="flex w-full max-w-32 flex-col items-center justify-center text-[15px] xl:max-w-none xl:border-r xl:border-[#3F3F3F]">
        <div className="flex items-center justify-center gap-1">Collateral vAPR</div>

        <MarketListAPR
          poolName={poolName}
          rewardToken={rewardToken}
          maxLeverage={1}
          currentAPRDetails={currentAPRDetails}
          projectedAPRDetails={projectedAPRDetails}
          apr={totalCurrentAPR}
          projectedApr={totalProjectedAPR}
          marketType={marketType}
          className="text-xl font-semibold"
        />
      </div>

      <div className="flex w-full max-w-32 flex-col items-center justify-center text-[15px] xl:max-w-none xl:border-r xl:border-[#3F3F3F]">
        <div className="flex items-center justify-center gap-1">
          Max vAPR
          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
              <button type="button">
                <IconCircleHelp className="h-auto w-[12px] text-white" />
              </button>
            </HoverCardTrigger>

            <HoverCardContent side="top" align="center" className="z-101 w-fit max-w-64 p-2 text-xs">
              vAPR of the collateral at max leverage.
            </HoverCardContent>
          </HoverCard>
        </div>

        <MarketListAPR
          poolName={poolName}
          rewardToken={rewardToken}
          maxLeverage={maxLeverage}
          currentAPRDetails={currentAPRDetails}
          projectedAPRDetails={projectedAPRDetails}
          apr={totalCurrentAPR}
          projectedApr={totalProjectedAPR}
          marketType={marketType}
          className="text-xl font-semibold"
        />
      </div>

      {indicators?.map((i, index) => (
        <RecordPageHeaderIndicator indicator={i?.indicator} key={index} title={i.title} value={i.value} subValue={i.subValue} className={i?.className || ""} />
      ))}
    </>
  )
}

type RecordPageHeaderIndicatorProps = {
  title: string
  value?: string | number | ReactNode
  subValue?: string | number | ReactNode
  indicator?: string
  className?: string
}

export const RecordPageHeaderIndicator = ({ title, value, subValue, indicator, className }: RecordPageHeaderIndicatorProps) => {
  return (
    <div
      className={cn(
        `flex w-full max-w-32 flex-col items-center justify-center text-[15px] xl:max-w-none`,
        `${title === "LT" ? "" : "xl:border-r xl:border-[#3F3F3F]"}`
      )}
    >
      <div className="flex items-center justify-center gap-1">
        {title}

        {!!indicator && (
          <>
            <HoverCard openDelay={100} closeDelay={100}>
              <HoverCardTrigger asChild>
                <button type="button">
                  <IconCircleHelp className="h-auto w-[12px] text-white" />
                </button>
              </HoverCardTrigger>

              <HoverCardContent side="top" align="center" className="z-101 w-fit max-w-64 p-2 text-xs">
                {indicator}
              </HoverCardContent>
            </HoverCard>
          </>
        )}
      </div>

      <span className={cn("items-centerﬂ flex text-xl font-semibold", className)}>{value}</span>
      <span className="text-xs text-subtitle">{subValue}</span>
    </div>
  )
}
