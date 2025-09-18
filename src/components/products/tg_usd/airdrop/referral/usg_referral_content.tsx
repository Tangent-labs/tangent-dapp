"use client"

import { useUSGContext } from "../../tg_usd_context"
import { IconShare } from "@/components/icons/icon_share"
import { IconTrophy } from "@/components/icons/icon_trophy"
import { ReferralHeader } from "./components/ReferralHeader"
import { useUsgAirdropContext } from "../usg_airdrop_context"
import { Button } from "@/components/design_system/inputs/button"
import { IconCompleted } from "@/components/icons/icon_completed"
import Divider from "@/components/design_system/structure/divider"
import { useUsgReferralCodeContext } from "./usg_referral_context"
import { GodsonsLeaderboard } from "./components/GodsonsLeaderboard"
import { VotingPointsLeaderboard } from "./components/VotingPointsLeaderboard"
import { LiquidityPointsLeaderboard } from "./components/LiquidityPointsLeaderboard"

export const UsgReferralCode = () => {
  const { lpUserPoints, voteUserPoints } = useUSGContext()

  const { setReferralStatus, referralStatus, signMessage, generateReferralCode } = useUsgAirdropContext()

  const { isLoading, lpLeaderboard, voteLeaderboard, godsonsLeaderboard } = useUsgReferralCodeContext()

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <ReferralHeader
        isLoading={isLoading}
        referralStatus={referralStatus}
        setReferralStatus={setReferralStatus}
        signMessage={signMessage}
        lpUserPoints={lpUserPoints}
        voteUserPoints={voteUserPoints}
      />

      <div className="mb-2 mt-6 flex w-full flex-col items-center justify-center rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
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

      <div className="my-2 flex w-full flex-col items-center justify-center rounded-[10px] bg-white bg-opacity-[5%] p-3 backdrop-blur-[60px]">
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

      <div className="mb-4 mt-2 flex w-full items-start justify-between gap-4">
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
