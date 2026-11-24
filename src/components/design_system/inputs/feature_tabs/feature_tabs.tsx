"use client"

import { Address } from "viem"
import { cn } from "@/lib/utils"
import { Pause } from "lucide-react"
import { UI_V2 } from "@/v2/ui"
import { motion } from "framer-motion"
import { LayoutGroup } from "framer-motion"
import { Divider } from "../../structure/divider"
import { LargeButtonTab } from "../large_button_tab"
import { FeatureTabsMotionDiv } from "./motion_div"
import { FeatureSelect } from "../../structure/feature_select"

const IS_LEVERAGE_ON = process.env.NEXT_PUBLIC_IS_LEVERAGE_ON === "true"

const PauseIcon = () => (
  <span className="absolute right-1 top-1 flex h-3 items-center" aria-hidden="true">
    <span className="h-2 w-0.5 bg-danger"></span>
    <span className="ml-0.5 h-2 w-0.5 bg-danger"></span>
  </span>
)

type FeatureTabsProps = {
  feature: string
  activeTab: string
  canLeverage: boolean
  marketAddress: Address
  isDepositPaused: boolean
  isBorrowPaused: boolean
  isLeveragePaused: boolean
  onClickBorrow: () => void
  onClickRepay: () => void
  onTabClick: (v: string) => void
  onTabClickLeverage: () => void
}

export const FeatureTabs = ({
  feature,
  activeTab,
  canLeverage,
  marketAddress,
  isDepositPaused,
  isBorrowPaused,
  isLeveragePaused,
  onClickBorrow,
  onClickRepay,
  onTabClick,
  onTabClickLeverage,
}: FeatureTabsProps) => {
  if (UI_V2) {
    const borrowTabs = [
      { key: "deposit-borrow", label: "Deposit & borrow", go: () => onTabClick("deposit&borrow"), paused: isDepositPaused || isBorrowPaused, enabled: true },
      {
        key: "leverage",
        label: "Leverage",
        go: () => IS_LEVERAGE_ON && onTabClickLeverage(),
        paused: isLeveragePaused || isBorrowPaused || isDepositPaused,
        enabled: IS_LEVERAGE_ON && canLeverage,
      },
      { key: "deposit", label: "Deposit", go: () => onTabClick("deposit"), paused: isDepositPaused, enabled: true },
      { key: "borrow", label: "Borrow", go: () => onTabClick("borrow"), paused: isBorrowPaused, enabled: true },
    ]
    const repayTabs = [
      { key: "repay-withdraw", label: "Repay & withdraw", go: () => onTabClick("repay&withdraw"), paused: false, enabled: true },
      { key: "repay", label: "Repay", go: () => onTabClick("repay"), paused: false, enabled: true },
      { key: "withdraw", label: "Withdraw", go: () => onTabClick("withdraw"), paused: false, enabled: true },
      { key: "liquidate", label: "Liquidate", go: () => onTabClick("liquidate"), paused: false, enabled: true },
    ]
    // the side follows the page on screen (the route), so it stays right after back/forward, links or the mobile action bar
    const side = repayTabs.some((t) => t.key === feature) ? "Repay" : borrowTabs.some((t) => t.key === feature) ? "Borrow" : activeTab
    const tabs = side === "Borrow" ? borrowTabs : repayTabs
    return (
      <div className="flex w-full flex-col">
        <div role="tablist" className="flex w-full gap-1 rounded-[10px] bg-white/[0.04] p-1">
          <LargeButtonTab label="Borrow" active={side === "Borrow"} onClick={onClickBorrow} />
          <LargeButtonTab label="Repay" active={side === "Repay"} onClick={onClickRepay} />
        </div>
        <div role="tablist" className="v2-chips mt-4 flex w-full justify-between gap-1 overflow-x-auto border-b border-hairline sm:gap-3">
          {tabs.map((t) => {
            const active = feature === t.key
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                disabled={!t.enabled}
                onClick={t.go}
                className={cn(
                  "relative shrink-0 whitespace-nowrap px-1 pb-2.5 pt-1 text-[13px] font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
                  active ? "text-white" : "text-ink-3 hover:text-ink-2"
                )}
              >
                {t.label}
                {t.paused && <Pause aria-label="Paused" className="ml-1 inline-block h-3 w-3 fill-current align-[-1px] text-warning" strokeWidth={0} />}
                {active && (
                  <motion.span
                    layoutId={`v2-action-${marketAddress}`}
                    className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-white"
                    transition={{ type: "spring", visualDuration: 0.35, bounce: 0.15 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="hidden w-full flex-col items-center justify-between gap-1 md:flex">
        <div className="flex w-full justify-between gap-2">
          <LargeButtonTab className="w-full !px-2" active={activeTab === "Borrow"} label={"Borrow"} onClick={onClickBorrow} />
          <LargeButtonTab className="w-full !px-2" active={activeTab === "Repay"} label={"Repay"} onClick={onClickRepay} />
        </div>

        <Divider />

        {activeTab === "Borrow" ? (
          <div className="flex w-full items-center justify-between gap-2.5 rounded-[10px] bg-white bg-opacity-[3%] text-xs">
            <LayoutGroup id={`feature-tabs-${marketAddress}`}>
              <div
                onClick={() => onTabClick("deposit&borrow")}
                className={cn(
                  "relative z-10 flex w-[128px] cursor-pointer items-center justify-center rounded-[10px] px-1 py-1.5 font-semibold transition-colors duration-200 ease-in-out hover:bg-white/10",
                  feature === "deposit-borrow" ? "text-black" : "text-white"
                )}
              >
                {feature === "deposit-borrow" && <FeatureTabsMotionDiv marketAddress={marketAddress} />}
                {(isDepositPaused || isBorrowPaused) && <PauseIcon />}
                <span className="relative z-20">Deposit & Borrow</span>
              </div>

              <div
                onClick={() => IS_LEVERAGE_ON && onTabClickLeverage()}
                className={cn(
                  "relative z-10 flex w-[128px] items-center justify-center rounded-[10px] px-1 py-1.5 font-semibold transition-colors duration-200 ease-in-out",
                  feature === "leverage" ? "text-black" : "text-white",
                  IS_LEVERAGE_ON && canLeverage ? "cursor-pointer hover:bg-white/10" : "cursor-not-allowed",
                  !IS_LEVERAGE_ON && "opacity-50"
                )}
              >
                {feature === "leverage" && <FeatureTabsMotionDiv marketAddress={marketAddress} />}
                {(isLeveragePaused || isBorrowPaused || isDepositPaused) && <PauseIcon />}
                <span className="relative z-20">Leverage</span>
              </div>

              <div
                onClick={() => onTabClick("deposit")}
                className={cn(
                  "relative z-10 flex w-[128px] cursor-pointer items-center justify-center rounded-[10px] px-1 py-1.5 font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-white/10",
                  feature === "deposit" ? "text-black" : "text-white"
                )}
              >
                {feature === "deposit" && <FeatureTabsMotionDiv marketAddress={marketAddress} />}
                {isDepositPaused && <PauseIcon />}
                <span className="relative z-20">Deposit</span>
              </div>
              <div
                onClick={() => onTabClick("borrow")}
                className={cn(
                  "relative z-10 flex w-[128px] cursor-pointer items-center justify-center rounded-[10px] px-1 py-1.5 font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-white/10",
                  feature === "borrow" ? "text-black" : "text-white"
                )}
              >
                {feature === "borrow" && <FeatureTabsMotionDiv marketAddress={marketAddress} />}
                {isBorrowPaused && <PauseIcon />}
                <span className="relative z-20">Borrow</span>
              </div>
            </LayoutGroup>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between gap-2.5 rounded-[10px] bg-white bg-opacity-[3%] text-xs">
            <div
              onClick={() => onTabClick("repay&withdraw")}
              className={cn(
                "relative z-10 flex w-[128px] cursor-pointer items-center justify-center rounded-[10px] px-1 py-1.5 font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-white/10",
                feature === "repay-withdraw" ? "text-black" : "text-white"
              )}
            >
              {feature === "repay-withdraw" && <FeatureTabsMotionDiv marketAddress={marketAddress} />}
              <span className="relative z-20">Repay & Withdraw</span>
            </div>

            <div
              onClick={() => onTabClick("liquidate")}
              className={cn(
                "relative z-10 flex w-[128px] cursor-pointer items-center justify-center rounded-[10px] px-1 py-1.5 font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-white/10",
                feature === "liquidate" ? "text-black" : "text-white"
              )}
            >
              {feature === "liquidate" && <FeatureTabsMotionDiv marketAddress={marketAddress} />}
              <span className="relative z-20">Liquidate</span>
            </div>

            <div
              onClick={() => onTabClick("repay")}
              className={cn(
                "relative z-10 flex w-[128px] cursor-pointer items-center justify-center rounded-[10px] px-1 py-1.5 font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-white/10",
                feature === "repay" ? "text-black" : "text-white"
              )}
            >
              {feature === "repay" && <FeatureTabsMotionDiv marketAddress={marketAddress} />}
              <span className="relative z-20">Repay</span>
            </div>

            <div
              onClick={() => onTabClick("withdraw")}
              className={cn(
                "relative z-10 flex w-[128px] cursor-pointer items-center justify-center rounded-[10px] px-1 py-1.5 font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-white/10",
                feature === "withdraw" ? "text-black" : "text-white"
              )}
            >
              {feature === "withdraw" && <FeatureTabsMotionDiv marketAddress={marketAddress} />}
              <span className="relative z-20">Withdraw</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex w-full flex-col items-center justify-between gap-1 md:hidden">
        <FeatureSelect
          options={[
            { value: "Deposit & Borrow", key: "deposit-borrow" },
            { value: "Leverage", key: "leverage", disabled: !IS_LEVERAGE_ON },
            { value: "Deposit", key: "deposit" },
            { value: "Borrow", key: "borrow" },
            { value: "Repay & Withdraw", key: "repay-withdraw" },
            { value: "Liquidate", key: "liquidate" },
            { value: "Repay", key: "repay" },
            { value: "Withdraw", key: "withdraw" },
          ]}
          value={feature}
          onChange={(v: string) => onTabClick(v)}
        ></FeatureSelect>
      </div>
    </>
  )
}
