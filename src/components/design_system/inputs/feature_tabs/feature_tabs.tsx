"use client"

import { Address } from "viem"
import { cn } from "@/lib/utils"
import { LayoutGroup } from "framer-motion"
import { Divider } from "../../structure/divider"
import { LargeButtonTab } from "../large_button_tab"
import { FeatureTabsMotionDiv } from "./motion_div"
import { FeatureSelect } from "../../structure/feature_select"

const IS_LEVERAGE_ON = process.env.NEXT_PUBLIC_IS_LEVERAGE_ON === "true"

type FeatureTabsProps = {
  feature: string
  activeTab: string
  canLeverage: boolean
  marketAddress: Address
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
  onClickBorrow,
  onClickRepay,
  onTabClick,
  onTabClickLeverage,
}: FeatureTabsProps) => {
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
