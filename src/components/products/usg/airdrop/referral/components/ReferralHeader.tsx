import { Input } from "@/components/ui/input"
import { UserStatus } from "../usg_referral_context"
import { formatNumber } from "@/lib/number_formatter"
import { LpUserPoints, VoteUserPoints } from "../../../usg_type"
import { SecondaryButton } from "@/components/design_system/inputs/secondary_button"

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
      <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row xl:flex-1 xl:justify-start">
        <div className="relative flex h-full w-full max-w-none flex-col items-center justify-center rounded-[10px] bg-overlay-panel px-8 py-4 backdrop-blur-[60px] md:max-w-56">
          <div className="absolute -top-2 left-0 flex w-full">
            <div className="mx-4 flex w-full items-center justify-center rounded-full">
              <div className="rounded-full bg-pink px-6 text-xs font-semibold text-black">Vote</div>
            </div>
          </div>

          <span className="text-sm text-subtitle">Voting points</span>
          <div className="flex items-end justify-center gap-1">
            <span className="text-sm font-semibold text-white">{formatNumber(voteUserPoints?.voteTotalPoints, 0)} pts</span>
          </div>
        </div>

        <div className="relative flex h-full w-full max-w-none flex-col items-center justify-center rounded-[10px] bg-overlay-panel px-8 py-4 backdrop-blur-[60px] md:max-w-80">
          <div className="absolute -top-2 left-0 flex w-full">
            <div className="mx-4 flex w-full items-center justify-center rounded-full">
              <div className="rounded-full bg-tonic px-6 text-xs font-semibold text-black">Liquidity</div>
            </div>
          </div>

          <span className="text-sm text-subtitle">Liquidity points</span>
          <div className="flex items-end justify-center gap-1">
            <span className="text-sm font-semibold text-white">{formatNumber(lpUserPoints?.lpTotalPoints, 0)} pts</span>
            <span className="bg-tonic bg-clip-text text-xs font-semibold text-transparent">
              ({formatNumber(lpUserPoints?.lpDailyRate * userBoost, 0)}pts/day)
            </span>
          </div>
        </div>

        <div className="hidden w-fit min-w-32 flex-col items-center justify-center rounded-[10px] bg-overlay-panel px-4 py-3 lg:flex">
          <span className="text-center text-sm text-subtitle">Your boost</span>
          <span className="text-center text-xl font-semibold text-white">x{userBoost}</span>
        </div>
      </div>

      {!referralStatus?.hasUsedCode && (
        <>
          <div className="flex w-full flex-col items-center gap-2 rounded-[10px] bg-overlay-panel px-3 py-5 backdrop-blur-[60px] xl:w-fit xl:flex-row">
            <div className="flex items-start justify-start border-white/10 text-xs text-subtitle xl:border-r xl:pr-3">
              Enter a code to get a x1.1 boost on all your points
            </div>

            <div className="flex w-full items-center justify-between gap-2 pl-3">
              <span className="text-xs font-semibold">Enter code</span>
              <Input
                disabled={!isConnected}
                placeholder="Type a referral code"
                className="px-auto mx-auto flex w-full max-w-36 items-center justify-center"
                onChange={(e) => setReferralStatus({ ...referralStatus, referralCode: e?.target?.value })}
                value={referralStatus?.referralCode as string}
              />
              <SecondaryButton onClick={signMessage} disabled={isLoading} className="flex w-full max-w-28 justify-center">
                Enter
              </SecondaryButton>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
