"use client"

import { cn } from "@/lib/utils"
import Divider from "../../structure/divider"
import LargeButtonTab from "../large_button_tab"
import { FeatureSelect } from "../../structure/feature_select"
import { FeatureTabsMotionDiv } from "./motion_div"
import { LayoutGroup } from "framer-motion"

type FeatureTabsProps = {
  feature: string
  activeTab: string
  canLeverage: boolean
  isRepayAndWithdraw: boolean
  isDepositAndBorrow: boolean
  onClickBorrow: () => void
  onClickRepay: () => void
  onTabClick: (v: string) => void
  onTabClickLeverage: () => void
}

export const FeatureTabs = ({
  feature,
  activeTab,
  canLeverage,
  isRepayAndWithdraw,
  isDepositAndBorrow,
  onClickBorrow,
  onClickRepay,
  onTabClick,
  onTabClickLeverage,
}: FeatureTabsProps) => {
  return (
    <>
      <div className="hidden w-full flex-col items-center justify-between gap-1 md:flex">
        <div className="mt-2 flex w-full justify-between gap-2">
          <LargeButtonTab className="w-full !px-2" active={activeTab === "Borrow"} label={"Borrow"} onClick={onClickBorrow} />
          <LargeButtonTab className="w-full !px-2" active={activeTab === "Repay"} label={"Repay"} onClick={onClickRepay} />
        </div>

        <Divider className="h-0.5 w-full bg-white/10" />

        <LayoutGroup id="feature-tabs">
          {activeTab === "Borrow" ? (
            <div className="flex w-full items-center justify-between gap-2 rounded-[10px] bg-white bg-opacity-[3%] text-xs">
              <div
                onClick={() => onTabClick("deposit&borrow")}
                className={cn(
                  "relative z-10 cursor-pointer rounded-[10px] px-4 py-1.5 font-semibold transition-colors hover:bg-white/10",
                  feature === "deposit-borrow" && isDepositAndBorrow ? "text-black" : "text-white"
                )}
              >
                {feature === "deposit-borrow" && isDepositAndBorrow && <FeatureTabsMotionDiv />}
                <span className="relative z-20">Deposit & Borrow</span>
              </div>

              <div
                onClick={() => onTabClickLeverage()}
                className={cn(
                  "relative z-10 rounded-[10px] px-4 py-1.5 font-semibold transition-colors hover:bg-white/10",
                  feature === "leverage" ? "text-black" : "text-white",
                  canLeverage ? "cursor-pointer" : "cursor-not-allowed"
                )}
              >
                {feature === "leverage" && <FeatureTabsMotionDiv />}
                <span className="relative z-20">Leverage</span>
              </div>

              <div
                onClick={() => onTabClick("deposit")}
                className={cn(
                  "relative z-10 cursor-pointer rounded-[10px] px-4 py-1.5 font-semibold text-white transition-colors hover:bg-white/10",
                  feature === "deposit" && !isDepositAndBorrow ? "text-black" : "text-white"
                )}
              >
                {feature === "deposit" && !isDepositAndBorrow && <FeatureTabsMotionDiv />}
                <span className="relative z-20">Deposit</span>
              </div>

              <div
                onClick={() => onTabClick("borrow")}
                className={cn(
                  "relative z-10 cursor-pointer rounded-[10px] px-4 py-1.5 font-semibold text-white transition-colors hover:bg-white/10",
                  feature === "borrow" ? "text-black" : "text-white"
                )}
              >
                {feature === "borrow" && <FeatureTabsMotionDiv />}
                <span className="relative z-20">Borrow</span>
              </div>
            </div>
          ) : (
            <div className="flex w-full items-center justify-between gap-2 rounded-[10px] bg-white bg-opacity-[3%] text-xs">
              <div
                onClick={() => onTabClick("repay&withdraw")}
                className={cn(
                  "relative z-10 cursor-pointer rounded-[10px] px-4 py-1.5 font-semibold text-white transition-colors hover:bg-white/10",
                  feature === "repay" && isRepayAndWithdraw ? "text-black" : "text-white"
                )}
              >
                {feature === "repay" && isRepayAndWithdraw && <FeatureTabsMotionDiv />}
                <span className="relative z-20">Repay & Withdraw</span>
              </div>

              <div
                onClick={() => onTabClick("liquidate")}
                className={cn(
                  "relative z-10 cursor-pointer rounded-[10px] px-4 py-1.5 font-semibold text-white transition-colors hover:bg-white/10",
                  feature === "liquidate" ? "text-black" : "text-white"
                )}
              >
                {feature === "liquidate" && <FeatureTabsMotionDiv />}
                <span className="relative z-20">Liquidate</span>
              </div>

              <div
                onClick={() => onTabClick("repay")}
                className={cn(
                  "relative z-10 cursor-pointer rounded-[10px] px-4 py-1.5 font-semibold text-white transition-colors hover:bg-white/10",
                  feature === "repay" && !isRepayAndWithdraw ? "text-black" : "text-white"
                )}
              >
                {feature === "repay" && !isRepayAndWithdraw && <FeatureTabsMotionDiv />}
                <span className="relative z-20">Repay</span>
              </div>

              <div
                onClick={() => onTabClick("withdraw")}
                className={cn(
                  "relative z-10 cursor-pointer rounded-[10px] px-4 py-1.5 font-semibold text-white transition-colors hover:bg-white/10",
                  feature === "withdraw" ? "text-black" : "text-white"
                )}
              >
                {feature === "withdraw" && <FeatureTabsMotionDiv />}
                <span className="relative z-20">Withdraw</span>
              </div>
            </div>
          )}
        </LayoutGroup>
      </div>

      <div className="flex w-full flex-col items-center justify-between gap-1 md:hidden">
        <FeatureSelect
          options={["Deposit", "Borrow", "Withdraw", "Repay", "Leverage", "Liquidate"]}
          value={feature}
          onChange={(v: string) => onTabClick(v)}
        ></FeatureSelect>
      </div>
    </>
  )
}
