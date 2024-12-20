"use client"

import { ReactNode, useCallback } from "react"
import { BoosterRecordProvider } from "./booster_record_context"
import { BoosterExistingAsset, BoosterStakingInfo } from "../booster_type"
import { AssetDataPriced } from "@/types"
import Divider from "@/components/design_system/structure/divider"
import Panel from "@/components/design_system/structure/panel"
import { useNavigationContext } from "../../product_nav/navigation_context"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import BoosterRecordApr from "./booster_record_apr"
import BoosterRecordContract from "./booster_record_contracts"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import { BoosterRecordPageHeader } from "./booster_record_page_header"
import { ButtonPanel } from "@/components/design_system/inputs/button_panel"
import BoosterButtonProMode from "./booster_button_pro_mode"

type BoosterRecordLayoutProps = {
  children: ReactNode
  assetInfo?: AssetDataPriced
  asset: BoosterExistingAsset
  rewardsInfo?: AssetDataPriced[]
  stakingInfo: BoosterStakingInfo
  sdAssetInfo?: AssetDataPriced
}

export default function BoosterRecordLayout({ children, asset, assetInfo, rewardsInfo, stakingInfo, sdAssetInfo }: BoosterRecordLayoutProps) {
  const { currentFeature, currentProduct, navigate } = useNavigationContext()
  const onTabClick = useCallback(
    (feature: string) => {
      if (currentFeature === feature) return
      navigate({ productTo: currentProduct, featureTo: feature, itemSlug: asset })
    },
    [currentFeature]
  )
  const onBackClick = useCallback(() => {
    navigate({ productTo: currentProduct, featureTo: "list", itemSlug: undefined })
  }, [currentFeature])

  return (
    <BoosterRecordProvider asset={asset} assetInfo={assetInfo} tokenInfo={rewardsInfo} stakingInfo={stakingInfo} sdAssetInfo={sdAssetInfo}>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <div> </div>
          <div>
            <ButtonPanel onClick={onBackClick}>Back</ButtonPanel>
          </div>
        </div>
        <div>
          <BoosterRecordPageHeader />
        </div>
        <Divider />
        <div className="flex gap-4 max-xl:flex-col">
          <div className="xl:w-1/2">
            <Panel className="h-full">
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <ButtonTab active={currentFeature === "deposit"} label={"Deposit"} onClick={() => onTabClick("deposit")} />
                  <ButtonTab active={currentFeature === "withdraw"} label={"Withdraw"} onClick={() => onTabClick("withdraw")} />
                </div>
                <div className="flex gap-2">
                  <BoosterButtonProMode />
                </div>
              </div>
              <div className="mt-5">{children}</div>
            </Panel>
          </div>
          <div className="flex h-full w-full flex-col gap-2 xl:w-1/2">
            <PanelRaw className="p-4">
              <BoosterRecordApr />
            </PanelRaw>
            <PanelRaw className="p-4">
              <BoosterRecordContract />
            </PanelRaw>
          </div>
        </div>
      </div>
    </BoosterRecordProvider>
  )
}
