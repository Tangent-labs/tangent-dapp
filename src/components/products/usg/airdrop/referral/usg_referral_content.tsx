"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useUSGContext } from "../../usg_context"
import { useClipboard } from "@/hooks/useClipboard"
import { formatNumber } from "@/lib/number_formatter"
import { Leaderboard } from "./components/Leaderboard"
import { useUsgAirdropContext } from "../usg_airdrop_context"
import { useUsgReferralCodeContext } from "./usg_referral_context"
import { GodsonsLeaderboard } from "./components/GodsonsLeaderboard"
import { Divider } from "@/components/design_system/structure/divider"
import { AirdropSharedHeader } from "../components/airdrop_side_header"
import { IconShare, IconTrophy, IconCompleted } from "@/components/icons"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { PageHeader } from "@/components/design_system/structure/page_header"
import { SecondaryButton } from "@/components/design_system/inputs/secondary_button"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

export const UsgReferralCode = () => {
  const { copied, copy } = useClipboard()

  const { isConnected, currentAddress } = useWalletConnexionContext()

  const { lpUserPoints, voteUserPoints, refereesPoints, userBoostFactor } = useUSGContext()

  const { lpLeaderboard, voteLeaderboard, godsonsLeaderboard } = useUsgReferralCodeContext()

  const { setReferralStatus, referralStatus, signMessage, airdropDataIsLoading, generateReferralCode } = useUsgAirdropContext()

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="flex w-full items-stretch justify-between gap-5">
        <PageHeader>
          <Image height={140} width={140} src="/medias/logos/referral.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />

          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Referral & leaderboard</span>
            <p className="text-[15px]">Refer your friends and earn 10% of their points.</p>
          </div>
        </PageHeader>

        <AirdropSharedHeader
          isConnected={isConnected}
          setReferralStatus={setReferralStatus}
          referralStatus={referralStatus}
          signMessage={signMessage}
          airdropDataIsLoading={airdropDataIsLoading}
          lpUserPoints={lpUserPoints}
          userBoostFactor={userBoostFactor}
          voteUserPoints={voteUserPoints}
        />
      </div>

      <ReliefCard className={cn("mt-5 flex w-full flex-col items-center justify-center p-5", !!airdropDataIsLoading && currentAddress ? "shimmer" : "")}>
        <div className="mr-auto text-lg font-semibold text-white">Your referral</div>

        <Divider />

        <div className="flex w-full flex-wrap items-center justify-between md:flex-nowrap">
          <div className="flex w-full flex-col items-center justify-center">
            <span className="text-sm text-subtitle">Referees liquidity points</span>
            <span className="bg-row-tonic bg-clip-text text-lg font-semibold text-transparent"> {formatNumber(refereesPoints.lpPoints, 0)} </span>
          </div>
          <div className="flex w-full flex-col items-center justify-center">
            <span className="text-sm text-subtitle">Referees voting points</span>
            <span className="bg-tonic bg-clip-text text-lg font-semibold text-transparent"> {formatNumber(refereesPoints.votePoints, 0)} </span>
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
                    onClick={() => copy(`${process.env.NEXT_PUBLIC_REFERAL_BASE_LINK}/referral?code=${referralStatus?.generatedCode}`)}
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
      </ReliefCard>

      <ReliefCard className="mt-4 hidden w-full flex-col items-center justify-center p-5 xl:flex">
        <div className="mr-auto text-lg font-semibold text-white">Airdrop referral</div>

        <Divider />

        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex w-full flex-col items-center justify-center">
            <IconShare></IconShare>

            <span className="text-lg font-semibold">Share link</span>
            <span className="mt-2 text-center text-sm text-subtitle">
              Connect a wallet. Generate a referral link. Invite your friends to register via your referral link.
            </span>
          </div>

          <div className="flex w-full flex-col items-center justify-center">
            <IconCompleted></IconCompleted>
            <span className="text-lg font-semibold">Complete tasks</span>
            <span className="mt-2 text-center text-sm text-subtitle">
              Ask your friends to complete tasks so that they earn points to be eligible for the airdrop.
            </span>
          </div>

          <div className="flex w-full flex-col items-center justify-center">
            <IconTrophy className="w-12 fill-row-tonic"></IconTrophy>
            <span className="text-lg font-semibold">Earn points</span>
            <span className="mt-2 text-center text-sm text-subtitle">
              Referrers will earn 10% of the points earned by their referred users, while referred users receive a 1.1x multiplier on all task points.{" "}
            </span>
          </div>
        </div>
      </ReliefCard>

      <div className="mt-4 flex w-full flex-wrap items-start justify-between gap-4 xl:flex-row xl:flex-nowrap">
        <ReliefCard className="flex w-full flex-col items-start justify-start p-5">
          <div className="mr-auto text-lg font-semibold text-white">Liquidity points leaderboard</div>

          <Divider />

          <Leaderboard leaderboard={lpLeaderboard} />
        </ReliefCard>

        <ReliefCard className="flex w-full flex-col items-center justify-center p-5">
          <div className="mr-auto text-lg font-semibold text-white">Vote points leaderboard</div>

          <Divider />

          <Leaderboard leaderboard={voteLeaderboard} feature="vote" />
        </ReliefCard>

        <ReliefCard className="flex w-full flex-col items-center justify-center p-5">
          <div className="mr-auto text-lg font-semibold text-white">My referees</div>

          <Divider />

          <GodsonsLeaderboard godsonsLeaderboard={godsonsLeaderboard} />
        </ReliefCard>
      </div>
    </div>
  )
}
