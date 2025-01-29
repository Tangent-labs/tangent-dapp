"use client"

import React, { useCallback } from "react"
import { useTgUsdRecordContext } from "./tg_usd_record_context"

import TgUsdRecordPageHeader from "./tg_usd_record_page_header"
import { useNavigationContext } from "../../product_nav/navigation_context"
import TgUsdLoanDetail from "./tg_usd_loan_detail"
import Divider from "@/components/design_system/structure/divider"
import Panel from "@/components/design_system/structure/panel"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import TgUsdCollateralPrice from "./tg_usd_collateral_price"
import TgUsdMarketInfo from "./tg_usd_market_info"

type TgUsdRecordLayoutProps = React.ButtonHTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
}

export default function TgUsdRecordLayout({ children, ...props }: TgUsdRecordLayoutProps) {
  const { currentFeature, currentProduct, navigate } = useNavigationContext()
  const { collateral } = useTgUsdRecordContext()

  const onTabClick = useCallback(
    (feature: string) => {
      if (currentFeature === feature) return
      navigate({ productTo: currentProduct, featureTo: feature, itemSlug: collateral })
    },
    [currentFeature]
  )
  const onBackClick = useCallback(() => {
    navigate({ productTo: currentProduct, featureTo: "list", itemSlug: undefined })
  }, [currentFeature])

  return (
    <>
      <div className="flex flex-col gap-4" {...props}>
        <TgUsdRecordPageHeader onBackClick={onBackClick} />
        <Divider />
        <TgUsdLoanDetail />
      </div>
      <div className="mt-2 flex h-full flex-col gap-4">
        <div className="flex h-full gap-4 max-xl:flex-col">
          <div className="xl:w-1/2">
            <Panel className="h-full">
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <ButtonTab active={currentFeature === "deposit"} label={"Deposit"} onClick={() => onTabClick("deposit")} />
                  <ButtonTab active={currentFeature === "borrow"} label={"Borrow"} onClick={() => onTabClick("borrow")} />
                  <ButtonTab active={currentFeature === "repay"} label={"Repay"} onClick={() => onTabClick("repay")} />
                  <ButtonTab active={currentFeature === "withdraw"} label={"Withdraw"} onClick={() => onTabClick("withdraw")} />
                  <ButtonTab active={currentFeature === "liquidate"} label={"Liquidate"} onClick={() => onTabClick("liquidate")} />
                </div>
              </div>
              <Divider />
              <div className="mt-5">{children}</div>
            </Panel>
          </div>
          <div className="flex w-full flex-col gap-2 xl:w-1/2">
            <PanelRaw className="h-full p-4">
              <TgUsdCollateralPrice />
            </PanelRaw>
          </div>
        </div>
        <div>
          <TgUsdMarketInfo />
        </div>
      </div>
    </>
  )
}
