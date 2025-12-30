"use client"

import { IconTangent } from "@/components/icons"
import { usePredepositContext } from "./predeposit.context"
import { PredepositFAQ } from "./components/predeposit-faq"
import { PredepositHeading } from "./components/predeposit-heading"
import { PredepositWalletConnect } from "../wallet/predeposit_wallet_connect"
import { PredepositDepositSection } from "./components/predeposit-deposit-section"
import { cn } from "@/lib/utils"

export const PredepositContent = () => {
  const { predepositStatus } = usePredepositContext()

  return (
    <>
      <header className="sticky top-0 z-50 flex h-[80px] w-full font-gilroy backdrop-blur-[60px]">
        <div className="mx-auto flex w-full">
          <div className="flex w-full items-center justify-between bg-overlay-panel backdrop-blur-[60px]">
            <div className="mx-2 flex w-full items-center justify-between lg:mx-4">
              <div className="flex cursor-pointer items-center justify-start gap-2 text-xl text-white">
                <IconTangent className="mb-2 w-32"></IconTangent>
              </div>

              <div className="mx-6 hidden items-center justify-center lg:flex">
                <span className="relative h-3 w-3 rounded-full border bg-white">
                  <div className="absolute -left-4 top-4 flex items-center justify-center text-sm text-subtitle">Private</div>
                </span>
                <span className="w-32 border-t border-white"></span>
                <span
                  className={cn("relative h-3 w-3 rounded-full", predepositStatus?.predepositState !== "deposit_private" ? "bg-white" : "border border-white")}
                >
                  <div className="absolute -left-3 top-4 flex items-center justify-center text-sm text-subtitle">Public</div>
                </span>
                <span className="w-32 border-t border-white"></span>
                <span
                  className={cn(
                    "relative h-3 w-3 rounded-full",
                    predepositStatus?.predepositState === "retention" || predepositStatus?.predepositState === "finished" ? "bg-white" : "border border-white"
                  )}
                >
                  <div className="absolute -left-6 top-4 flex items-center justify-center text-sm text-subtitle">Retention</div>
                </span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <PredepositWalletConnect />
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="usg-container mx-auto flex min-h-[80vh] w-full flex-col bg-repeat px-2 md:px-8 lg:px-4">
        <div className="mb-6 flex flex-col items-start justify-center">
          <PredepositHeading
            USGUSDCAccumulatedBalance={predepositStatus?.USGUSDCData.USGUSDCAccumulatedBalance || 0n}
            USGfrxUSDAccumulatedBalance={predepositStatus?.USGfrxUSDData.USGfrxUSDAccumulatedBalance || 0n}
            accumulatedBalance={
              (predepositStatus?.USGUSDCData.USGUSDCAccumulatedTotal || 0n) + (predepositStatus?.USGfrxUSDData.USGfrxUSDAccumulatedTotal || 0n)
            }
          />

          <PredepositDepositSection />

          <PredepositFAQ />
        </div>
      </div>
    </>
  )
}
