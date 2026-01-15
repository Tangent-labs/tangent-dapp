"use client"

import { useState, useEffect, useMemo } from "react"
import TokenImage from "@/components/design_system/structure/token_image"
import { formatBigInt, formatBigIntAsNumber } from "@/lib/number_formatter"
import { formatTimeNumber, TOTAL_DEPOSIT_CAP, TOTAL_TAN_ALLOCATION } from "../predeposit.controller"

type PredepositRetentionPhaseProps = {
  amount: bigint
}

const PREDEPOSIT_CAP = 6_500_000n * 10n ** 18n

export const PredepositRetentionPhase = ({ amount }: PredepositRetentionPhaseProps) => {
  const targetDate = new Date("2026-02-22T00:00:00").getTime()

  const computeTimeLeft = () => {
    const now = new Date().getTime()
    const timeDiff = targetDate - now

    if (timeDiff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds }
  }

  const [timeLeft, setTimeLeft] = useState(computeTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(computeTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const tanAllocation = useMemo(() => {
    return (amount * TOTAL_TAN_ALLOCATION) / TOTAL_DEPOSIT_CAP
  }, [amount])

  return (
    <section className="mt-12 flex w-full flex-col items-center justify-center">
      {amount === PREDEPOSIT_CAP && <div className="text-center text-4xl text-subtitle">Cap reached</div>}

      <div className="text-[80px] font-semibold text-white lg:text-[120px]"> ${formatBigInt(amount, 18, 0)} </div>
      <div className="flex items-center gap-0 lg:gap-12">
        <div className="flex w-24 flex-col items-center justify-center">
          <div className="text-4xl font-light tracking-wider text-white">{formatTimeNumber(timeLeft.days)}</div>
          <div className="mt-4 text-xl uppercase text-gray-400 md:mt-6">Days</div>
        </div>

        <div className="flex w-24 flex-col items-center justify-center">
          <div className="text-4xl font-light tracking-wider text-white">{formatTimeNumber(timeLeft.hours)}</div>
          <div className="mt-4 text-xl uppercase text-gray-400 md:mt-6">Hours</div>
        </div>

        <div className="flex w-24 flex-col items-center justify-center">
          <div className="text-4xl font-light tracking-wider text-white">{formatTimeNumber(timeLeft.minutes)}</div>
          <div className="mt-4 text-xl uppercase text-gray-400 md:mt-6">Minutes</div>
        </div>

        <div className="flex w-24 flex-col items-center justify-center">
          <div className="text-4xl font-light tracking-wider text-white">{formatTimeNumber(timeLeft.seconds)}</div>
          <div className="mt-4 text-xl uppercase text-gray-400 md:mt-6">Seconds</div>
        </div>
      </div>

      <div className="my-8 flex w-full max-w-[640px] items-center justify-between rounded-[10px] bg-overlay-panel px-3 py-4 backdrop-blur-[60px]">
        <span className="text-[20px] font-semibold">TAN distributed</span>
        <span className="flex items-center justify-center gap-2 text-[30px] font-semibold">
          {formatBigIntAsNumber(tanAllocation, 18, 0)} <TokenImage token="tan" size={12} className="w-8" />
        </span>
      </div>
    </section>
  )
}
