"use client"

import Link from "next/link"
import Image from "next/image"
import { useMemo } from "react"
import { IconOpenOutside } from "@/components/icons"
import { formatBigInt } from "@/lib/number_formatter"
import { useVsTanContext } from "./rstan_layout_context"
import { IconStars } from "@/components/icons/icon_stars"
import { PageHeader } from "@/components/design_system/structure/page_header"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { PointsCampaignLiveCard } from "@/components/design_system/structure/points_campaign_live_card"

export const TanPageHeader = () => {
  // const isStakeSection = !!pathname?.startsWith("/tan/stake")

  const { lockData } = useVsTanContext()

  const vsTanBalance = useMemo(() => lockData?.positions.reduce((acc, position) => acc + position.amount, 0n), [lockData])

  return (
    <>
      <div className="flex w-full items-stretch justify-between gap-5">
        <PageHeader>
          {/* {isStakeSection ? (
            <>
              <Image height={150} width={150} src="/medias/tokens/TAN.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />

              <div className="flex flex-col items-start justify-center px-6">
                <span className="text-4xl font-semibold">Stake TAN</span>
                <p className="mt-2 text-xs">
                  Stake TAN to receive sTAN and earn a share of protocol earnings passively. Staked TAN stays liquid and carries no governance rights.
                </p>
                <Link
                  className="flex cursor-pointer items-center justify-center text-xs underline hover:text-white/30"
                  href="https://docs.tangent.finance/docs/tan/stan"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more about sTAN <IconOpenOutside className="ml-1 mt-1 flex w-4 fill-white text-xs" />
                </Link>
              </div>
            </>
          ) : (
            <>
              <Image height={140} width={140} src={`/medias/tokens/TANvsTAN.webp`} alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />

              <div className="flex flex-col items-start justify-center gap-1 px-6">
                <span className="text-4xl font-semibold">Lock TAN</span>
                <p className="text-xs">
                  Convert and stake your governance tokens to earn boosted yield while staying liquid. It is also possible to provide liquidity in stable pools
                  (SDT stable pool & CVX stable pool).
                </p>
                <p className="text-xs">Rewards are distributed weekly, at the beginning of each epoch. Staking positions are represented by NFTs.</p>
                <Link
                  className="flex cursor-pointer items-center justify-center text-xs underline hover:text-white/30"
                  href="https://docs.tangent.finance/docs/tan/vstan"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more about vsTAN <IconOpenOutside className="ml-1 mt-1 flex w-4 fill-white text-xs" />
                </Link>
              </div>
            </>
          )} */}

          <Image height={140} width={140} src={`/medias/tokens/TANvsTAN.webp`} alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />

          <div className="flex flex-col items-start justify-center gap-1 px-6">
            <span className="text-4xl font-semibold">Lock TAN</span>
            <p className="text-xs">
              Convert and stake your governance tokens to earn boosted yield while staying liquid. It is also possible to provide liquidity in stable pools (SDT
              stable pool & CVX stable pool).
            </p>
            <p className="text-xs">Rewards are distributed weekly, at the beginning of each epoch. Staking positions are represented by NFTs.</p>
            <Link
              className="flex cursor-pointer items-center justify-center text-xs underline hover:text-white/30"
              href="https://docs.tangent.finance/docs/tan/vstan"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about vsTAN <IconOpenOutside className="ml-1 mt-1 flex w-4 fill-white text-xs" />
            </Link>
          </div>
        </PageHeader>

        <div className="flex h-auto w-full flex-col items-center justify-between gap-3 xl:w-1/2">
          <PointsCampaignLiveCard />

          <ReliefCard className="relative mb-2 grid w-full grid-cols-2 gap-x-2 gap-y-4 px-3 py-[15.5px] md:grid-cols-4 md:gap-2 xl:mb-0">
            <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: 'url("./medias/card_bg_blocks.png")' }} />

            <div className="flex w-full flex-col items-center justify-center">
              <div className="text-xs font-semibold text-subtitle">vsTAN Balance</div>
              <div className="text-md flex items-center justify-center gap-1 font-semibold text-white">
                <span>{formatBigInt(vsTanBalance, 18, 2)}</span>
                <TokenImage token="VSTAN" size={16} className="w-4" />
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center">
              <div className="text-xs font-semibold text-subtitle">vsTAN APR</div>
              <div className="text-md flex items-center justify-center gap-1 font-semibold text-white">
                {/* LockUI returns the APR as a 1e18-scaled fraction (1e18 = 100%), so 16 decimals gives a percentage */}
                {formatBigInt(lockData?.tanAPR, 16, 2)}%
                <IconStars className="fill-row-tonic" />
              </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center">
              <div className="text-xs font-semibold text-subtitle">Total vsTAN Locked</div>
              <div className="text-md flex items-center justify-center gap-1 font-semibold text-white">
                <span>{formatBigInt(lockData?.totalLocked, 18, 2)}</span>
                <TokenImage token="VSTAN" size={16} className="w-4" />
              </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center">
              <div className="text-xs font-semibold text-subtitle">Supply Locked</div>
              <div className="text-md flex items-center justify-center gap-1 font-semibold text-white">
                {/* LockUI returns the share of circulating supply (DAO excluded) as a 1e18-scaled fraction */}
                {formatBigInt(lockData?.percentageLocked, 16, 2)}%
              </div>
            </div>

            {/* sTAN metrics, kept aside while the sTAN release is undecided. Data source once it ships :
                `TANsTANMetrics.sTanBalance` from useUSGContext (sTANUI chain view) and the `SAVING_APY_TAN`
                indicator from /savingAccounts/apy (indexer side currently commented out).

            <div className="flex w-full flex-col items-center justify-center">
              <div className="text-xs font-semibold text-subtitle">sTAN Balance</div>
              <div className="text-md flex items-center justify-center gap-1 font-semibold text-white">
                <span>10,384</span>

                <TokenImage token="STAN" size={16} className="w-4" />
              </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center">
              <div className="text-xs font-semibold text-subtitle">sTAN APY</div>
              <div className="text-md flex items-center justify-center gap-1 font-semibold text-white">
                12%
                <IconStars className="fill-row-tonic" />
              </div>
            </div>
            */}
          </ReliefCard>
        </div>
      </div>

      {/* <SlidingTabs
        className="my-4"
        labels={["vsTAN", "sTAN"]}
        value={isStakeSection ? "sTAN" : "vsTAN"}
        onSwitchTab={(label: string) => router.push(label === "sTAN" ? "/tan/stake" : "/tan/lock")}
      /> */}
    </>
  )
}
