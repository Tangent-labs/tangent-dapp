"use client"

import React from "react"
import { useTgUsdRecordContext } from "./tg_usd_record_context"
import TgUsdRecordPageHeader from "./tg_usd_record_page_header"
import TgUsdLoanDetail from "./tg_usd_loan_detail"
import Divider from "@/components/design_system/structure/divider"
import Panel from "@/components/design_system/structure/panel"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import TgUsdCollateralPrice from "./tg_usd_collateral_price"
import TgUsdMarketInfo from "./tg_usd_market_info"
import { useRouter } from "next/navigation"

type TgUsdRecordLayoutProps = React.ButtonHTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
  currentFeature: string
}

export default function TgUsdRecordLayout({ children, currentFeature, ...props }: TgUsdRecordLayoutProps) {
  const { collateral } = useTgUsdRecordContext()
  const router = useRouter()

  const onTabClick = (feat: string) => {
    if (feat === "deposit") {
      router.push(`/${collateral}`)
    } else {
      router.push(`/${collateral}/${feat}`)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4" {...props}>
        <TgUsdRecordPageHeader />
        <Divider />
        <TgUsdLoanDetail />
      </div>
      <div className="mt-2 flex h-full flex-col gap-4">
        <div className="flex gap-4 max-xl:flex-col">
          <div className="xl:w-1/2">
            <Panel className="p-1">
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
            <Panel className="p-1">
              <TgUsdCollateralPrice />
            </Panel>
          </div>
        </div>
        <div>
          <TgUsdMarketInfo />
        </div>
      </div>
    </>
  )
}
