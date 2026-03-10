import { IconCircleHelp } from "@/components/icons"
import { formatBigInt, formatMillions } from "@/lib/number_formatter"
import { ThreeCardRowWithMask } from "./three_cards_with_background_and_neon"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { LpUserPoints, USGStakingInfo, VoteUserPoints } from "@/components/products/usg/usg_type"

type UsgBalanceAndTotalPointsProps = {
  USGsUSGMetrics: USGStakingInfo | undefined
  voteUserPoints: VoteUserPoints
  lpUserPoints: LpUserPoints
}

export const UsgBalanceAndTotalPoints = ({ USGsUSGMetrics, voteUserPoints, lpUserPoints }: UsgBalanceAndTotalPointsProps) => {
  return (
    <ThreeCardRowWithMask
      contents={[
        { key: "USG Balance", value: formatMillions(formatBigInt(USGsUSGMetrics?.USGBalance || 0n, 18, 2)) },
        { key: "sUSG Balance", value: formatMillions(formatBigInt(USGsUSGMetrics?.sUSGBalance || 0n, 18, 2)) },
        {
          key: "Your Total Points",
          value: (
            <div className="flex w-full items-center justify-center gap-2 text-white transition duration-200">
              {formatMillions(lpUserPoints?.lpTotalPoints + voteUserPoints?.voteTotalPoints)} pts
              <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <button type="button">
                    <IconCircleHelp className="w-3 fill-white" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent
                  side="top"
                  align="center"
                  className="z-[9999] flex w-full flex-col items-center justify-center border border-white/10 p-2 text-sm text-subtitle"
                >
                  <div className="flex w-full items-center justify-center">Lp points : {formatMillions(lpUserPoints?.lpTotalPoints)}</div>
                  <div className="flex w-full items-center justify-center">Vote points : {formatMillions(voteUserPoints?.voteTotalPoints)}</div>
                </HoverCardContent>
              </HoverCard>
            </div>
          ),
        },
      ]}
    />
  )
}
