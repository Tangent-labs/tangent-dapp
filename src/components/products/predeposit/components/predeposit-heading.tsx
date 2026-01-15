"use client"

import Image from "next/image"
import { useMemo } from "react"
import { formatUnits } from "viem"
import { formatNumber } from "@/lib/number_formatter"
import TokenImage from "@/components/design_system/structure/token_image"
import { TOTAL_DEPOSIT_CAP, TOTAL_TAN_ALLOCATION } from "../predeposit.controller"

type PredepositHeadingProps = {
  USGUSDCAccumulatedBalance: bigint
  USGfrxUSDAccumulatedBalance: bigint
}

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
          <div className="flex h-44 w-full flex-col items-center justify-center rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
            <span className="p-4 text-[16px] text-white">A fixed and guaranteed share of 2% of TAN total supply.</span>
            <Image src="/medias/fulltan.png" className="flex items-end self-end" alt="image" width={220} height={80} />
          </div>
          <div className="flex h-44 w-full flex-col rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
            <span className="p-4 text-[16px] text-white">Trading fee and CRV rewards if you stake your LP tokens.</span>
            <Image src="/medias/crvtokens.png" className="flex items-end self-end" alt="image" width={200} height={80} />
          </div>
          <div className="flex h-44 w-full flex-col rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
            <span className="px-4 pt-4 text-[16px] text-white">A 2x boost for the point campaign.</span>
            <Image src="/medias/timestwo.png" className="flex items-end self-end" alt="image" width={160} height={80} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 pl-0 xl:w-fit xl:min-w-[400px] xl:border-l xl:border-l-white/30 xl:pl-4">
          <div className="flex w-full items-center justify-between rounded-[10px] bg-overlay-panel px-3 py-4 backdrop-blur-[60px]">
            <span className="text-[20px] font-semibold">Your TAN allocation</span>
            <span className="flex items-center justify-center gap-2 text-[30px] font-semibold">
              {formatNumber(Number(tanAllocation), 0)}
              <TokenImage token="tan" size={12} className="w-8" />
            </span>
          </div>

          <div className="flex w-full items-center justify-center gap-3">
            <div className="flex w-full flex-col items-center justify-center gap-2 rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
              <span className="flex items-center justify-center gap-2 font-semibold">
                <TokenImage token="USG-USDC" size={12} className="w-12" />
                USG/USDC
              </span>
              <span> {formatNumber(Number(formatUnits(BigInt(USGUSDCAccumulatedBalance || 0n), 18)), 0)} </span>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-2 rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
              <span className="flex items-center justify-center gap-2 font-semibold">
                <TokenImage token="USG-frxUSD" size={12} className="w-12" />
                USG/frxUSD
              </span>
              <span> {formatNumber(Number(formatUnits(BigInt(USGfrxUSDAccumulatedBalance || 0n), 18)), 0)} </span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
