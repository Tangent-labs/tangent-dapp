"use client"

import { Input } from "@/components/ui/input"
import { useUSGContext } from "../tg_usd_context"
import { formatNumber } from "@/lib/number_formatter"
import { IconShare } from "@/components/icons/icon_share"
import { IconTrophy } from "@/components/icons/icon_trophy"
import { Button } from "@/components/design_system/inputs/button"
import { IconCompleted } from "@/components/icons/icon_completed"
import Divider from "@/components/design_system/structure/divider"
import { useUsgReferralCodeContext } from "./usg_referral_context"
import { LiquidityPointsLeaderboard } from "./LiquidityPointsLeaderboard"
import { VotingPointsLeaderboard } from "./VotingPointsLeaderboard"
import { GodsonsLeaderboard } from "./GodsonsLeaderboard"

export const UsgReferralCode = () => {
  const { userPoints } = useUSGContext()

  const { isLoading, referralStatus, lpLeaderboard, voteLeaderboard, godsonsLeaderboard, setReferralStatus, signMessage, generateReferralCode } =
    useUsgReferralCodeContext()

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="relative flex w-full max-w-80 flex-col items-center justify-center rounded-[10px] bg-overlay-panel px-8 py-3 backdrop-blur-[60px]">
          <div className="absolute -top-2 left-0 flex w-full">
            <div className="mx-4 flex w-full items-center justify-between rounded-full bg-[#070707] px-4">
              <div className="px-2 text-xs italic">Boost x1.1</div>
              <div className="rounded-full bg-tonic px-6 text-xs font-semibold text-black">Vote</div>
            </div>
          </div>

          <span className="text-[14px] text-subtitle">Voting points</span>
          <div className="flex items-end justify-center gap-1">
            <span className="text-sm font-semibold text-white">1385 pts</span>
            <span className="text-xs text-tonic">(30pts/day)</span>
          </div>
        </div>

        <div className="relative flex w-full max-w-80 flex-col items-center justify-center rounded-[10px] bg-overlay-panel px-8 py-3 backdrop-blur-[60px]">
          <div className="absolute -top-2 left-0 flex w-full">
            <div className="mx-4 flex w-full items-center justify-between rounded-full bg-[#070707] px-4">
              <div className="px-2 text-xs italic">Boost x1.5</div>
              <div className="rounded-full bg-pink px-6 text-xs font-semibold text-black">Liquidity</div>
            </div>
          </div>

          <span className="text-[14px] text-subtitle">Liquidity points</span>
          <div className="flex items-end justify-center gap-1">
            <span className="text-sm font-semibold text-white">{formatNumber(userPoints?.totalPoints, 0)} pts</span>
            <span className="text-xs text-tonic">({formatNumber(userPoints?.dailyRate, 0)}pts/day)</span>
          </div>
        </div>

        {referralStatus?.hasUsedCode ? (
          <div className="flex w-full max-w-96 items-center gap-2 rounded-[10px] bg-overlay-panel px-3 py-4 backdrop-blur-[60px]">
            Enjoy a x1.1 boost on all your points thanks to your friend referral link !{" "}
            <div className="rounded-full bg-tonic px-6 text-sm font-semibold text-black">x1.1</div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-[10px] bg-overlay-panel px-3 py-4 backdrop-blur-[60px]">
            <div className="flex items-start justify-start border-r border-white/10 pr-3 text-xs text-subtitle">
              Enter a code to get a x1.1 boost on all your points
            </div>

            <div className="flex w-full items-center justify-between gap-2 pl-3">
              <span className="text-xs font-semibold">Enter code</span>
              <Input
                placeholder="Type a referral code"
                className="px-auto mx-auto flex max-w-36 items-center justify-center"
                onChange={(e) => setReferralStatus({ ...referralStatus, referralCode: e?.target?.value })}
                value={referralStatus?.referralCode as string}
              />
              <Button onClick={signMessage} disabled={isLoading} className="flex w-full max-w-24 justify-center">
                Enter
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex w-full flex-col items-center justify-center rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
        <div className="mr-auto text-lg font-semibold text-white">Your referral</div>

        <Divider className="h-0.5 w-full bg-white/10" />

        <div className="flex w-full items-center justify-between">
          <div className="flex w-full flex-col items-center justify-center">
            <span className="text-sm text-subtitle">Referees voting points</span>
            <span className="bg-tonic bg-clip-text text-lg font-semibold text-transparent"> 10,500</span>
          </div>
          <div className="flex w-full flex-col items-center justify-center">
            <span className="text-sm text-subtitle">Referees Liquidity points</span>
            <span className="bg-pink bg-clip-text text-lg font-semibold text-transparent"> 10,500 </span>
          </div>
          <div className="flex w-full flex-col items-center justify-center">
            <span className="text-sm text-subtitle">Your Referees</span>
            <span className="text-lg font-semibold">{referralStatus?.friends}</span>
          </div>

          {referralStatus?.generatedCode ? (
            <>
              <div className="flex w-full flex-col items-center justify-center">
                <span className="text-sm text-subtitle">Your code</span>
                <span className="text-lg font-semibold">{referralStatus?.generatedCode}</span>
              </div>
              <div className="flex w-full flex-col items-center justify-center">
                <Button className="flex w-32 justify-center font-semibold">Share</Button>
              </div>
            </>
          ) : (
            <div className="flex w-full items-center justify-center gap-2">
              <div className="flex w-full items-center justify-center text-center text-xs text-subtitle">Get a referral code for a friend</div>
              <Button onClick={generateReferralCode} className="flex w-full max-w-24 justify-center font-semibold">
                Generate
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="my-4 flex w-full flex-col items-center justify-center rounded-[10px] bg-white bg-opacity-[5%] p-3 backdrop-blur-[60px]">
        <div className="mr-auto text-lg font-semibold text-white">Airdrop referral</div>

        <Divider className="h-0.5 w-full bg-white/10" />

        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex w-full flex-col items-center justify-center rounded-[10px] p-3 backdrop-blur-[60px]">
            <IconShare></IconShare>

            <span className="text-lg font-semibold">Share link</span>
            <span className="mt-2 text-center text-sm text-subtitle">
              Connect a wallet to generate a referral link. Invite your friends to register via your referral link.
            </span>
          </div>

          <div className="flex w-full flex-col items-center justify-center rounded-[10px] p-3 backdrop-blur-[60px]">
            <IconCompleted></IconCompleted>
            <span className="text-lg font-semibold">Complete tasks</span>
            <span className="mt-2 text-center text-sm text-subtitle">
              Ask your friends to complete tasks so that they earn points to be eligible for the airdrop.
            </span>
          </div>

          <div className="flex w-full flex-col items-center justify-center rounded-[10px] p-3 backdrop-blur-[60px]">
            <IconTrophy className="w-12 fill-row-tonic"></IconTrophy>
            <span className="text-lg font-semibold">Earn points</span>
            <span className="mt-2 text-center text-sm text-subtitle">
              Referrer will earn 10% of referees points, referees will have a x1.1 boost on all tasks points.
            </span>
          </div>
        </div>
      </div>

      <div className="my-4 flex w-full items-start justify-between gap-4">
        <div className="flex w-full flex-col items-start justify-start rounded-[10px] bg-white bg-opacity-[5%] p-3 backdrop-blur-[60px]">
          <div className="mr-auto text-lg font-semibold text-white">Liquidity points leaderboard</div>

          <Divider className="h-0.5 w-full bg-white/10" />

          <LiquidityPointsLeaderboard lpLeaderboard={lpLeaderboard} />
        </div>

        <div className="flex w-full flex-col items-center justify-center rounded-[10px] bg-white bg-opacity-[5%] p-3 backdrop-blur-[60px]">
          <div className="mr-auto text-lg font-semibold text-white">Vote points leaderboard</div>

          <Divider className="h-0.5 w-full bg-white/10" />

          <VotingPointsLeaderboard voteLeaderboard={voteLeaderboard} />
        </div>

        <div className="flex w-full flex-col items-center justify-center rounded-[10px] bg-white bg-opacity-[5%] p-3 backdrop-blur-[60px]">
          <div className="mr-auto text-lg font-semibold text-white">My referees</div>

          <Divider className="h-0.5 w-full bg-white/10" />

          <GodsonsLeaderboard godsonsLeaderboard={godsonsLeaderboard} />
        </div>
      </div>
    </div>
  )
}
