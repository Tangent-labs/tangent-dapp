"use client"

import Image from "next/image"
import { useMemo } from "react"
import { formatUnits } from "viem"
import { formatDollar, formatNumber } from "@/lib/number_formatter"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { TOTAL_DEPOSIT_CAP, TOTAL_TAN_ALLOCATION } from "../predeposit.controller"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { NeonLightCard } from "@/components/design_system/structure/neon_light_card"
import { IconCircleHelp } from "@/components/icons"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { PoolLiquidity } from "../types/types"
import { cn } from "@/lib/utils"

type PredepositHeadingProps = {
  USGUSDCAccumulatedBalance: bigint
  USGfrxUSDAccumulatedBalance: bigint
  USGUSDCLiquidity: PoolLiquidity | null
  USGfrxUSDLiquidity: PoolLiquidity | null
}

const color1 = "#0077ff67"
const color2 = "#0075FF"

export const PredepositHeading = ({ USGUSDCAccumulatedBalance, USGfrxUSDAccumulatedBalance, USGUSDCLiquidity, USGfrxUSDLiquidity }: PredepositHeadingProps) => {
  const tanAllocation = useMemo(() => {
    return ((USGUSDCAccumulatedBalance + USGfrxUSDAccumulatedBalance) * TOTAL_TAN_ALLOCATION) / (TOTAL_DEPOSIT_CAP * 10n ** 18n)
  }, [USGUSDCAccumulatedBalance, USGfrxUSDAccumulatedBalance])

  const liquidityItems = useMemo(() => {
    const totalUsd = !!USGUSDCLiquidity && !!USGfrxUSDLiquidity ? USGUSDCLiquidity?.usdTotal + USGfrxUSDLiquidity?.usdTotal : null

    return [
      { key: "Total Liquidity", value: totalUsd ?? null, indicator: "Total liquidity in Curve pools.", coins: null },
      { key: "USG/frxUSD", value: USGfrxUSDLiquidity?.usdTotal ?? null, indicator: "", coins: USGfrxUSDLiquidity?.coins },
      { key: "USG/USDC", value: USGUSDCLiquidity?.usdTotal ?? null, indicator: "", coins: USGUSDCLiquidity?.coins },
    ]
  }, [USGUSDCLiquidity, USGfrxUSDLiquidity])

  return (
    <>
      <div className="mt-6 flex w-full items-end justify-between">
        <div className="flex w-full flex-col items-start justify-start">
          <span className="text-2xl font-semibold text-white lg:text-4xl">Pre-deposit campaign</span>
          <span className="hidden text-sm text-subtitle xl:flex">Deposit USDC or frxUSD and receive LP tokens to earn:</span>
        </div>

        <NeonLightCard
          paddingHorizontal={0} // No padding here because we already have space in this div
          className="hidden w-full xl:mt-0 xl:flex xl:w-7/12"
          color1="#0077ffa3"
          color2="#0075FF"
        >
          <div className="flex items-center gap-2 xl:gap-4">
            <div className="flex w-full items-center justify-between py-0.5">
              {liquidityItems.map((item, index) => (
                <div className={cn("flex-1 text-center", index > 0 ? "xl:border-l xl:border-white/10" : "")} key={item.key}>
                  <div className="flex items-center justify-center">
                    <HoverCard openDelay={50} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <button type="button" className="inline-flex items-center">
                          <IconCircleHelp className="w-3 fill-subtitle" />
                        </button>
                      </HoverCardTrigger>

                      <HoverCardContent side="top" align="center" className="z-[1001] w-fit max-w-64 p-2 text-xs">
                        {item.coins && item.coins.length > 0 ? (
                          <div className="flex min-w-32 flex-col gap-3">
                            {[...item.coins]
                              .sort((a, b) => (a.symbol === "USG" ? -1 : b.symbol === "USG" ? 1 : 0))
                              .map((coin) => (
                                <div className="flex items-center justify-between gap-5 text-subtitle" key={coin.symbol}>
                                  <span className="flex items-center gap-1.5">
                                    <TokenImage token={coin.symbol} size={16} className="h-4 w-4" />
                                    {coin.symbol}
                                  </span>
                                  <span className="text-white">{formatDollar(coin.usdValue, 0)}</span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          item.indicator
                        )}
                      </HoverCardContent>
                    </HoverCard>

                    <div className="ml-2 text-center text-xs text-subtitle">{item.key}</div>
                  </div>
                  <div className="mt-1 text-center text-[16px] font-semibold">{item.value === null ? "—" : formatDollar(item.value, 0)} </div>
                </div>
              ))}
            </div>
          </div>
        </NeonLightCard>
      </div>

      <section className="mt-4 flex w-full flex-col-reverse items-center justify-center gap-4 xl:flex-row">
        <div className="hidden w-full items-center justify-center gap-[10px] lg:flex">
          <ReliefCard className="flex h-[174px] w-full flex-col justify-between">
            <span className="p-[20px] text-[16px] text-white">A fixed and guaranteed share of 2% of TAN total supply.</span>
            <Image src="/medias/fulltan.png" className="flex items-end self-end" alt="image" width={220} height={80} />
          </ReliefCard>
          <ReliefCard className="flex h-[174px] w-full flex-col justify-between">
            <span className="p-[20px] text-[16px] text-white">Trading fees and CRV rewards if you stake your LP tokens.</span>
            <Image src="/medias/crvtokens.png" className="flex items-end self-end" alt="image" width={200} height={80} />
          </ReliefCard>
          <ReliefCard className="flex h-[174px] w-full flex-col justify-between">
            <span className="px-[20px] pt-[20px] text-[16px] text-white">2x boost for the point campaign.</span>
            <Image src="/medias/timestwo.png" className="flex items-end self-end" alt="image" width={160} height={80} />
          </ReliefCard>
        </div>

        <div className="flex w-full flex-col gap-[10px] pl-0 xl:w-fit xl:min-w-[400px] xl:border-l xl:border-l-white/10 xl:pl-4">
          <ReliefCard className="relative flex w-full items-center justify-between p-[18px]">
            <div className="absolute inset-0 rounded-[10px] bg-cover bg-center opacity-20" style={{ backgroundImage: 'url("./medias/card_bg_blocks.png")' }} />

            <div
              className="absolute inset-0 rounded-[10px]"
              style={{
                left: 0,
                width: "100%",
                background: `
                  linear-gradient(0deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03)), 
                  radial-gradient(50.04% 50% at 50% 100%, ${color1} 0%, rgba(0, 0, 0, 0) 100%)
                `,
              }}
            />

            <div
              className="pointer-events-none absolute inset-0 rounded-lg"
              style={{
                padding: "1px",
                left: 0,
                width: "100%",
                background: `
                  radial-gradient(49.97% 49.97% at 50% 100%, #FFFFFF 0%,
                  ${color2} 19.71%, rgba(0, 0, 0, 0) 100%), 
                  linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%,
                  rgba(255, 255, 255, 0.1) 100%)
                `,
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />

            <span className="relative text-xl font-semibold">Your TAN allocation</span>
            <span className="relative flex items-center justify-center gap-2 text-[32px] font-semibold">
              {formatNumber(Number(tanAllocation), 0)}
              <TokenImage token="tan" size={12} className="w-8" />
            </span>
          </ReliefCard>

          <div className="flex w-full items-center justify-center gap-[10px]">
            <ReliefCard className="flex w-full flex-col items-center justify-center gap-2 p-[20px]">
              <span className="flex items-center justify-center gap-2 font-semibold">
                <TokenImage token="USG-USDC" size={12} className="w-10" />
                USG/USDC
              </span>
              <span className="text-sm text-subtitle"> {formatNumber(Number(formatUnits(BigInt(USGUSDCAccumulatedBalance || 0n), 18)), 0)} </span>
            </ReliefCard>
            <ReliefCard className="flex w-full flex-col items-center justify-center gap-2 p-[20px]">
              <span className="flex items-center justify-center gap-2 font-semibold">
                <TokenImage token="USG-frxUSD" size={12} className="w-10" />
                USG/frxUSD
              </span>
              <span className="text-sm text-subtitle">{formatNumber(Number(formatUnits(BigInt(USGfrxUSDAccumulatedBalance || 0n), 18)), 0)} </span>
            </ReliefCard>
          </div>
        </div>
      </section>
    </>
  )
}
