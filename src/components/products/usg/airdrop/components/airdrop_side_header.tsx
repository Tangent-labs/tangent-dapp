"use client"

import { cn } from "@/lib/utils"
import { UserStatus } from "../usg_airdrop_context"
import { LpUserPoints, VoteUserPoints } from "../../usg_type"
import { formatMillions, formatNumber } from "@/lib/number_formatter"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { SecondaryButton } from "@/components/design_system/inputs/secondary_button"
import { NeonMetricsCard } from "@/components/design_system/structure/neon_metrics_card"

type ReferralFormProps = {
  customInputClass: string
  customButtonClass: string
  isConnected: boolean
  setReferralStatus: (s: UserStatus) => void
  referralStatus: UserStatus
  signMessage: () => void
  airdropDataIsLoading: boolean
}

const ReferralForm = ({
  customInputClass,
  customButtonClass,
  isConnected,
  setReferralStatus,
  referralStatus,
  signMessage,
  airdropDataIsLoading,
}: ReferralFormProps) => {
  return (
    <>
      <input
        disabled={!isConnected}
        placeholder="Type a referral code"
        className={cn(
          customInputClass +
            " auto relative h-[30px] w-full items-center justify-center rounded-[10px] border-tangent border-white/20 bg-transparent text-center text-xs backdrop-blur-[60px] backdrop-filter focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        )}
        onChange={(e) => setReferralStatus({ ...referralStatus, referralCode: e?.target?.value })}
        value={referralStatus?.referralCode as string}
      />
      <SecondaryButton
        onClick={signMessage}
        disabled={airdropDataIsLoading}
        className={cn("relative w-full min-w-10 max-w-40 justify-center " + customButtonClass)}
      >
        Enter
      </SecondaryButton>
    </>
  )
}

type AirdropSharedHeaderProps = {
  isConnected: boolean
  setReferralStatus: (s: UserStatus) => void
  referralStatus: UserStatus
  signMessage: () => void
  airdropDataIsLoading: boolean
  lpUserPoints: LpUserPoints
  userBoostFactor: number
  voteUserPoints: VoteUserPoints
}

export const AirdropSharedHeader = ({
  isConnected,
  setReferralStatus,
  referralStatus,
  signMessage,
  airdropDataIsLoading,
  lpUserPoints,
  userBoostFactor,
  voteUserPoints,
}: AirdropSharedHeaderProps) => {
  return (
    <div className="flex h-auto w-full flex-col items-center gap-4 xl:w-1/2">
      <ReliefCard className="relative mb-2 flex w-full flex-col items-center justify-between gap-2 px-3 py-4 md:flex-row xl:mb-0">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: 'url("./medias/card_bg_blocks.png")' }} />

        {!airdropDataIsLoading && referralStatus?.hasUsedCode ? (
          <div className="flex w-full py-1.5">Referral code applied — enjoy a permanent +0.1 points boost multiplicator.</div>
        ) : (
          <>
            <div className="flex w-full items-start justify-start border-white/10 px-2 py-0.5 text-xs text-subtitle xl:border-r xl:pr-3">
              Enter a code to get a x1.1 boost on all your points
            </div>

            <span className="hidden w-full max-w-16 text-xs font-semibold md:flex">Enter code</span>
            <div className="flex w-full items-center justify-between gap-2 xl:hidden">
              <ReferralForm
                isConnected={isConnected}
                setReferralStatus={setReferralStatus}
                referralStatus={referralStatus}
                signMessage={signMessage}
                airdropDataIsLoading={airdropDataIsLoading}
                customInputClass="relative flex"
                customButtonClass="flex"
              ></ReferralForm>
            </div>

            <ReferralForm
              isConnected={isConnected}
              setReferralStatus={setReferralStatus}
              referralStatus={referralStatus}
              signMessage={signMessage}
              airdropDataIsLoading={airdropDataIsLoading}
              customInputClass=" hidden max-w-48 p-2.5 xl:flex"
              customButtonClass="hidden xl:flex"
            ></ReferralForm>
          </>
        )}
      </ReliefCard>

      <div className="flex w-full flex-col items-start justify-between gap-2 md:flex-row">
        <NeonMetricsCard
          title="Liquidity"
          subtitle="Liquidity points"
          value={`${formatMillions(lpUserPoints?.lpTotalPoints)} pts`}
          extra={`(${formatMillions(lpUserPoints?.lpDailyRate * userBoostFactor)} pts/day)`}
          color1="#0077ffa3"
          color2="#0075FF"
          className="h-full w-full"
        />

        <NeonMetricsCard
          title="Vote"
          subtitle="Voting points"
          value={`${formatNumber(voteUserPoints?.voteTotalPoints, 0)} pts`}
          color1="#95ff006d"
          color2="#95FF00"
          className="h-full w-full min-w-48 xl:w-auto"
        />

        <ReliefCard className="hidden w-fit min-w-32 flex-col items-center justify-center gap-1 self-end px-4 py-2 lg:flex">
          <span className="text-center text-sm text-subtitle">Your boost</span>
          <span className="text-center text-xl font-semibold text-white">x{userBoostFactor}</span>
        </ReliefCard>
      </div>
    </div>
  )
}
