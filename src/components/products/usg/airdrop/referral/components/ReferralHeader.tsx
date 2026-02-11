import { UserStatus } from "../usg_referral_context"
import { formatNumber } from "@/lib/number_formatter"
import { LpUserPoints, VoteUserPoints } from "../../../usg_type"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { SecondaryButton } from "@/components/design_system/inputs/secondary_button"
import { NeonMetricsCard } from "@/components/design_system/structure/neon_metrics_card"

type ReferralHeaderProps = {
  isLoading: boolean
  referralStatus: UserStatus
  setReferralStatus: (arg: UserStatus) => void
  signMessage: () => void
  lpUserPoints: LpUserPoints
  voteUserPoints: VoteUserPoints
  isConnected: boolean
  userBoost: number
}

export const ReferralHeader = ({
  isLoading,
  referralStatus,
  setReferralStatus,
  signMessage,
  lpUserPoints,
  voteUserPoints,
  isConnected,
  userBoost,
}: ReferralHeaderProps) => {
  return (
    <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 xl:flex-row">
      <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row xl:w-1/2 xl:justify-start">
        <NeonMetricsCard
          title="Vote"
          subtitle="Voting points"
          value={`${formatNumber(voteUserPoints?.voteTotalPoints, 0)} pts`}
          color1="#FA00FF"
          color2="rgba(251, 0, 255, 0.2)"
          className="h-full"
        />

        <NeonMetricsCard
          title="Liquidity"
          subtitle="Liquidity points"
          value={`${formatNumber(lpUserPoints?.lpTotalPoints, 0)} pts`}
          extra={`(${formatNumber(lpUserPoints?.lpDailyRate * userBoost, 0)}pts/day)`}
          color1="#95FF00"
          color2="rgba(149, 255, 0, 0.2)"
          className="h-full"
        />

        <ReliefCard className="hidden w-fit min-w-32 flex-col items-center justify-center gap-1 self-end rounded-[10px] bg-overlay-panel px-4 py-2 lg:flex">
          <span className="text-center text-sm text-subtitle">Your boost</span>
          <span className="text-center text-xl font-semibold text-white">x{userBoost}</span>
        </ReliefCard>
      </div>

      {!referralStatus?.hasUsedCode && (
        <>
          <ReliefCard className="relative flex w-full flex-col items-center justify-between gap-2 rounded-[10px] bg-overlay-panel px-3 py-4 backdrop-blur-[60px] xl:w-1/2 xl:flex-row">
            <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: 'url("./medias/card_bg_blocks.png")' }} />

            <div className="flex w-full items-start justify-start border-white/10 px-2 py-0.5 text-xs text-subtitle xl:border-r xl:pr-3">
              Enter a code to get a x1.1 boost on all your points
            </div>

            <span className="w-full max-w-16 text-xs font-semibold">Enter code</span>
            <input
              disabled={!isConnected}
              placeholder="Type a referral code"
              className="relative mx-auto flex h-[30px] w-full max-w-44 items-center justify-center rounded-[10px] border-tangent border-white/20 bg-transparent p-2.5 text-center text-xs backdrop-blur-[60px] backdrop-filter focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(e) => setReferralStatus({ ...referralStatus, referralCode: e?.target?.value })}
              value={referralStatus?.referralCode as string}
            />
            <SecondaryButton onClick={signMessage} disabled={isLoading} className="relative flex w-full min-w-10 max-w-40 justify-center">
              Enter
            </SecondaryButton>
          </ReliefCard>
        </>
      )}
    </div>
  )
}
