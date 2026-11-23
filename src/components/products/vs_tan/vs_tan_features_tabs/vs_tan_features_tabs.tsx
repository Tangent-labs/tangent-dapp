"use client"

import { cn } from "@/lib/utils"
import { LayoutGroup } from "framer-motion"
import { FeatureSelect } from "@/components/design_system/structure/feature_select"
import { FeatureTabsMotionDiv } from "@/components/design_system/inputs/feature_tabs/motion_div"

type VsTanFeatureTabsProps = {
  feature: string
  onTabClick: (v: string) => void
}

export const VsTanFeatureTabs = ({ feature, onTabClick }: VsTanFeatureTabsProps) => {
  return (
    <>
      <div className="hidden w-full flex-col items-center justify-between gap-1 md:flex">
        <div className="flex w-full items-center justify-between gap-2.5 rounded-[10px] bg-white bg-opacity-[3%] text-xs">
          <LayoutGroup id={`feature-tabs-vstan`}>
            <div
              onClick={() => onTabClick("lock")}
              className={cn(
                "relative z-10 flex w-[128px] cursor-pointer items-center justify-center rounded-[10px] px-1 py-1.5 font-semibold transition-colors duration-200 ease-in-out hover:bg-white/10",
                feature === "lock" ? "text-black" : "text-white"
              )}
            >
              {feature === "lock" && <FeatureTabsMotionDiv marketAddress="feature-tabs-vstan" />}
              <span className="relative z-20">Lock</span>
            </div>

            <div
              onClick={() => onTabClick("unlock")}
              className={cn(
                "relative z-10 flex w-[128px] cursor-pointer items-center justify-center rounded-[10px] px-1 py-1.5 font-semibold transition-colors duration-200 ease-in-out hover:bg-white/10",
                feature === "unlock" ? "text-black" : "text-white"
              )}
            >
              {feature === "unlock" && <FeatureTabsMotionDiv marketAddress="feature-tabs-vstan" />}
              <span className="relative z-20">Unlock</span>
            </div>

            <div
              onClick={() => onTabClick("claim")}
              className={cn(
                "relative z-10 flex w-[128px] cursor-pointer items-center justify-center rounded-[10px] px-1 py-1.5 font-semibold transition-colors duration-200 ease-in-out hover:bg-white/10",
                feature === "claim" ? "text-black" : "text-white"
              )}
            >
              {feature === "claim" && <FeatureTabsMotionDiv marketAddress="feature-tabs-vstan" />}
              <span className="relative z-20">Claim</span>
            </div>

            <div
              onClick={() => onTabClick("split")}
              className={cn(
                "relative z-10 flex w-[128px] cursor-pointer items-center justify-center rounded-[10px] px-1 py-1.5 font-semibold transition-colors duration-200 ease-in-out hover:bg-white/10",
                feature === "split" ? "text-black" : "text-white"
              )}
            >
              {feature === "split" && <FeatureTabsMotionDiv marketAddress="feature-tabs-vstan" />}
              <span className="relative z-20">Split</span>
            </div>

            <div
              onClick={() => onTabClick("merge")}
              className={cn(
                "relative z-10 flex w-[128px] cursor-pointer items-center justify-center rounded-[10px] px-1 py-1.5 font-semibold transition-colors duration-200 ease-in-out hover:bg-white/10",
                feature === "merge" ? "text-black" : "text-white"
              )}
            >
              {feature === "merge" && <FeatureTabsMotionDiv marketAddress="feature-tabs-vstan" />}
              <span className="relative z-20">Merge</span>
            </div>
          </LayoutGroup>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-between gap-1 md:hidden">
        <FeatureSelect
          options={[
            { value: "Lock", key: "lock" },
            { value: "Unlock", key: "unlock" },
            { value: "Claim", key: "claim" },
            { value: "Split", key: "split" },
            { value: "Merge", key: "merge" },
          ]}
          value={feature}
          onChange={(v: string) => onTabClick(v)}
        ></FeatureSelect>
      </div>
    </>
  )
}
