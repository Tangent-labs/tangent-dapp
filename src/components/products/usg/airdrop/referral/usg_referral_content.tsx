"use client"

import { cn } from "@/lib/utils"
import { useClipboard } from "@/hooks/useClipboard"
import { useUSGContext } from "../../usg_context"
import { formatNumber } from "@/lib/number_formatter"
import { Leaderboard } from "./components/Leaderboard"
import { IconShare, IconTrophy, IconCompleted } from "@/components/icons"
import { ReferralHeader } from "./components/ReferralHeader"
import { useUsgAirdropContext } from "../usg_airdrop_context"
import Divider from "@/components/design_system/structure/divider"
import { useUsgReferralCodeContext } from "./usg_referral_context"
import { GodsonsLeaderboard } from "./components/GodsonsLeaderboard"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { SecondaryButton } from "@/components/design_system/inputs/secondary_button"

export const UsgReferralCode = () => {
  const { isConnected, currentAddress } = useWalletConnexionContext()

  const { copied, copy } = useClipboard()

  const { lpUserPoints, voteUserPoints, refereesPoints } = useUSGContext()

  const { isLoading, lpLeaderboard, voteLeaderboard, godsonsLeaderboard } = useUsgReferralCodeContext()

  const { setReferralStatus, referralStatus, signMessage, airdropDataIsLoading, generateReferralCode, userBoostFactor } = useUsgAirdropContext()

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <ReferralHeader
        isLoading={isLoading}
        referralStatus={referralStatus}
        setReferralStatus={setReferralStatus}
        signMessage={signMessage}
        lpUserPoints={lpUserPoints}
        voteUserPoints={voteUserPoints}
        isConnected={isConnected}
        userBoost={userBoostFactor}
      />

      <div
        className={cn(
          "mt-4 flex w-full flex-col items-center justify-center rounded-[10px] bg-overlay-panel px-5 py-3 backdrop-blur-[60px]",
          !!airdropDataIsLoading && currentAddress ? "shimmer" : ""
        )}
      >
        <div className="mr-auto text-lg font-semibold text-white">Your referral</div>

        <Divider className="h-0.5 w-full bg-white/10" />

        <div className="flex w-full flex-wrap items-center justify-between md:flex-nowrap">
          <div className="flex w-full flex-col items-center justify-center">
            <span className="text-sm text-subtitle">Referees voting points</span>
            <span className="bg-pink bg-clip-text text-lg font-semibold text-transparent"> {formatNumber(refereesPoints.votePoints, 0)} </span>
          </div>
          <div className="flex w-full flex-col items-center justify-center">
            <span className="text-sm text-subtitle">Referees liquidity points</span>
            <span className="bg-tonic bg-clip-text text-lg font-semibold text-transparent"> {formatNumber(refereesPoints.lpPoints, 0)} </span>
          </div>
          <div className="flex w-full flex-col items-center justify-center">
            <span className="text-sm text-subtitle">Your referees</span>
            <span className="text-lg font-semibold">{referralStatus?.friends}</span>
          </div>

          <div className="flex w-full items-center justify-center gap-2">
            {referralStatus?.generatedCode && !airdropDataIsLoading && isConnected && (
              <>
                <div className="flex w-full flex-col items-center justify-center">
                  <span className="text-sm text-subtitle">Your code</span>
                  <span className="text-lg font-semibold">{referralStatus?.generatedCode}</span>
                </div>
                <div className="flex w-full flex-col items-center justify-center">
                  <SecondaryButton
                    onClick={() => copy(`https://tangent-dapp.vercel.app/referral?code=${referralStatus?.generatedCode}`)}
                    className="flex w-32 justify-center font-semibold"
                  >
                    {copied ? "Copied" : "Share"}
                  </SecondaryButton>
                </div>
              </>
            )}

            {!referralStatus?.generatedCode && !airdropDataIsLoading && isConnected && (
              <>
                <div className="flex w-full items-center justify-center text-center text-xs text-subtitle">Get a referral code for a friend</div>
                <SecondaryButton onClick={generateReferralCode} className="flex w-full max-w-24 justify-center font-semibold">
                  Generate
                </SecondaryButton>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 hidden w-full flex-col items-center justify-center rounded-[10px] bg-white bg-opacity-[5%] p-3 backdrop-blur-[60px] xl:flex">
        <div className="mr-auto text-lg font-semibold text-white">Airdrop referral</div>

        <Divider className="h-0.5 w-full bg-white/10" />

        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex w-full flex-col items-center justify-center rounded-[10px] p-3 backdrop-blur-[60px]">
            <IconShare></IconShare>

            <span className="text-lg font-semibold">Share link</span>
            <span className="mt-2 text-center text-sm text-subtitle">
              Connect a wallet. Generate a referral link. Invite your friends to register via your referral link.
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

      <div className="mt-4 flex w-full flex-wrap items-start justify-between gap-4 xl:flex-row xl:flex-nowrap">
        <div className="flex w-full flex-col items-start justify-start rounded-[10px] bg-white bg-opacity-[5%] p-3 backdrop-blur-[60px]">
          <div className="mr-auto text-lg font-semibold text-white">Liquidity points leaderboard</div>

          <Divider className="h-0.5 w-full bg-white/10" />

          <Leaderboard leaderboard={lpLeaderboard} />
        </div>

        <div className="flex w-full flex-col items-center justify-center rounded-[10px] bg-white bg-opacity-[5%] p-3 backdrop-blur-[60px]">
          <div className="mr-auto text-lg font-semibold text-white">Vote points leaderboard</div>

          <Divider className="h-0.5 w-full bg-white/10" />

          <Leaderboard leaderboard={voteLeaderboard} feature="vote" />
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
