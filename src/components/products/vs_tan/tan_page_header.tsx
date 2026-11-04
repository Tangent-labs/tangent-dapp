"use client"

import Link from "next/link"
import Image from "next/image"
import { useMemo } from "react"
import { IconOpenOutside } from "@/components/icons"
import { formatBigInt } from "@/lib/number_formatter"
import { useVsTanContext } from "./vstan_layout_context"
import { IconStars } from "@/components/icons/icon_stars"
import { PageHeader } from "@/components/design_system/structure/page_header"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { FeatureBannerCarousel } from "@/components/design_system/structure/feature_banner_carousel"

export const TanPageHeader = () => {
  const { lockData } = useVsTanContext()

  const vsTanBalance = useMemo(() => lockData?.positions.reduce((acc, position) => acc + position.amount, 0n), [lockData])

  return (
    <>
      <div className="flex w-full items-stretch justify-between gap-5">
        <PageHeader>
          <Image height={140} width={140} src={`/medias/tokens/TANvsTAN.webp`} alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />

          <div className="flex flex-col items-start justify-center gap-1 px-6">
            <span className="text-4xl font-semibold">TAN</span>
            <p className="text-[15px]">
              Lock your TAN for vsTAN to earn a share of protocol revenue and governance rights. Locked positions are tokenized; you can split and/or merge
              them. Unlocking before the scheduled date will result in a penalty.
            </p>
            <Link
              className="flex cursor-pointer items-center justify-center text-sm underline hover:text-white/30 xl:text-[15px]"
              href="https://docs.tangent.finance/docs/tan/vstan"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about vsTAN <IconOpenOutside className="ml-1 mt-1 flex w-4 fill-white text-sm xl:text-[15px]" />
            </Link>
          </div>
        </PageHeader>

        <div className="flex h-auto w-full flex-col items-center justify-between gap-[10px] xl:w-1/2">
          <FeatureBannerCarousel />

          <ReliefCard className="relative mb-2 grid w-full grid-cols-2 gap-x-2 gap-y-4 px-3 py-4 md:grid-cols-4 md:gap-2 xl:mb-0">
            {/* Absolute url : the relative one resolved to /tan/medias/... on nested routes. pointer-events-none so the stats stay selectable,
                -z-10 so it paints behind them (the card's backdrop-blur keeps it above the card background) */}
            <div
              className="pointer-events-none absolute inset-0 -z-10 rounded-[10px] bg-cover bg-center opacity-20"
              style={{ backgroundImage: 'url("/medias/card_bg_blocks.png")' }}
            />

            <div className="flex w-full flex-col items-center justify-center">
              <div className="mb-1 text-xs text-subtitle">vsTAN Balance</div>
              <div className="text-md flex items-center justify-center gap-1 font-semibold text-white">
                <span>{formatBigInt(vsTanBalance, 18, 2)}</span>
                <TokenImage token="VSTAN" size={16} className="w-4" />
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center">
              <div className="mb-1 text-xs text-subtitle">vsTAN APR</div>
              <div className="text-md flex items-center justify-center gap-1 font-semibold text-white">
                {/* LockUI returns the APR as a 1e18-scaled fraction (1e18 = 100%), so 16 decimals gives a percentage */}
                {formatBigInt(lockData?.tanAPR, 16, 2)}%
                <IconStars className="fill-row-tonic" />
              </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center">
              <div className="mb-1 text-xs text-subtitle">Total vsTAN Locked</div>
              <div className="text-md flex items-center justify-center gap-1 font-semibold text-white">
                <span>{formatBigInt(lockData?.totalLocked, 18, 2)}</span>
                <TokenImage token="VSTAN" size={16} className="w-4" />
              </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center">
              <div className="mb-1 text-xs text-subtitle">Supply Locked</div>
              <div className="text-md flex items-center justify-center gap-1 font-semibold text-white">
                {/* LockUI returns the share of circulating supply (DAO excluded) as a 1e18-scaled fraction */}
                {formatBigInt(lockData?.percentageLocked, 16, 2)}%
              </div>
            </div>

            {/* sTAN metrics, kept aside while the sTAN release is undecided. Data source once it ships :
                `TANsTANMetrics.sTanBalance` from useUSGContext (sTANUI chain view) and the `SAVING_APY_TAN`
                indicator from /savingAccounts/apy (indexer side currently commented out).

            <div className="flex w-full flex-col items-center justify-center">
              <div className="mb-1 text-xs text-subtitle">sTAN Balance</div>
              <div className="text-md flex items-center justify-center gap-1 font-semibold text-white">
                <span>10,384</span>

                <TokenImage token="STAN" size={16} className="w-4" />
              </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center">
              <div className="mb-1 text-xs text-subtitle">sTAN APY</div>
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
