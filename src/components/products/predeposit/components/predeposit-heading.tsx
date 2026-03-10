"use client"

import Image from "next/image"
import { useMemo } from "react"
import { formatUnits } from "viem"
import { formatNumber } from "@/lib/number_formatter"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { TOTAL_DEPOSIT_CAP, TOTAL_TAN_ALLOCATION } from "../predeposit.controller"
import { ReliefCard } from "@/components/design_system/structure/relief_card"

type PredepositHeadingProps = {
  USGUSDCAccumulatedBalance: bigint
  USGfrxUSDAccumulatedBalance: bigint
}

const color1 = "#0077ff67"
const color2 = "#0075FF"

export const PredepositHeading = ({ USGUSDCAccumulatedBalance, USGfrxUSDAccumulatedBalance }: PredepositHeadingProps) => {
  const tanAllocation = useMemo(() => {
    return ((USGUSDCAccumulatedBalance + USGfrxUSDAccumulatedBalance) * TOTAL_TAN_ALLOCATION) / (TOTAL_DEPOSIT_CAP * 10n ** 18n)
  }, [USGUSDCAccumulatedBalance, USGfrxUSDAccumulatedBalance])

  return (
    <>
      <span className="mt-4 text-2xl font-semibold text-white lg:text-4xl">Pre-deposit campaign</span>
      <span className="hidden text-sm text-subtitle xl:flex">Deposit USDC or frxUSD and receive LP tokens to earn:</span>

      <section className="mt-4 flex w-full flex-col-reverse items-center justify-center gap-4 xl:flex-row">
        <div className="hidden w-full items-center justify-center gap-2 lg:flex">
          <ReliefCard className="flex h-44 w-full flex-col items-center justify-center">
            <span className="p-4 text-[16px] text-white">A fixed and guaranteed share of 2% of TAN total supply.</span>
            <Image src="/medias/fulltan.png" className="flex items-end self-end" alt="image" width={220} height={80} />
          </ReliefCard>
          <ReliefCard className="flex h-44 w-full flex-col">
            <span className="p-4 text-[16px] text-white">Trading fees and CRV rewards if you stake your LP tokens.</span>
            <Image src="/medias/crvtokens.png" className="flex items-end self-end" alt="image" width={200} height={80} />
          </ReliefCard>
          <ReliefCard className="flex h-44 w-full flex-col">
            <span className="px-4 pt-4 text-[16px] text-white">2x boost for the point campaign.</span>
            <Image src="/medias/timestwo.png" className="flex items-end self-end" alt="image" width={160} height={80} />
          </ReliefCard>
        </div>

        <div className="flex w-full flex-col gap-2 pl-0 xl:w-fit xl:min-w-[400px] xl:border-l xl:border-l-white/30 xl:pl-4">
          <ReliefCard className="relative flex w-full items-center justify-between px-3 py-4">
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

            <span className="text-xl font-semibold">Your TAN allocation</span>
            <span className="relative flex items-center justify-center gap-2 text-[32px] font-semibold">
              {formatNumber(Number(tanAllocation), 0)}
              <TokenImage token="tan" size={12} className="w-8" />
            </span>
          </ReliefCard>

          <div className="flex w-full items-center justify-center gap-3">
            <ReliefCard className="flex w-full flex-col items-center justify-center gap-2 p-3">
              <span className="flex items-center justify-center gap-2 font-semibold">
                <TokenImage token="USG-USDC" size={12} className="w-12" />
                USG/USDC
              </span>
              <span> {formatNumber(Number(formatUnits(BigInt(USGUSDCAccumulatedBalance || 0n), 18)), 0)} </span>
            </ReliefCard>
            <ReliefCard className="flex w-full flex-col items-center justify-center gap-2 p-3">
              <span className="flex items-center justify-center gap-2 font-semibold">
                <TokenImage token="USG-frxUSD" size={12} className="w-12" />
                USG/frxUSD
              </span>
              <span> {formatNumber(Number(formatUnits(BigInt(USGfrxUSDAccumulatedBalance || 0n), 18)), 0)} </span>
            </ReliefCard>
          </div>
        </div>
      </section>
    </>
  )
}
