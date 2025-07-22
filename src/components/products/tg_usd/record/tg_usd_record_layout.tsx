"use client"

import { useTgUsdRecordContext } from "./tg_usd_record_context"
import TgUsdRecordPageHeader from "./tg_usd_record_page_header"
import TgUsdLoanDetail from "./tg_usd_loan_detail"
import Divider from "@/components/design_system/structure/divider"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import TgUsdCollateralPrice from "./tg_usd_collateral_price"
import TgUsdMarketInfo from "./tg_usd_market_info"
import { usePathname, useRouter } from "next/navigation"
import { useMemo } from "react"
import TgUsdPositionHistory from "./position_history/tg_usd_position_history"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"

type TgUsdRecordLayoutProps = React.ButtonHTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
}

export default function TgUsdRecordLayout({ children, ...props }: TgUsdRecordLayoutProps) {
  const { collateral, isLeveraged, setIsLeveraged } = useTgUsdRecordContext()

  const router = useRouter()

  const path = usePathname()

  const feature = useMemo(() => {
    const lastIndexOfSlash = path.lastIndexOf("/") + 1
    const currentFeature = path.substring(lastIndexOfSlash, path.length)

    return currentFeature
  }, [path])

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
      <div className="my-4 flex flex-col gap-4">
        <div className="flex gap-4 max-xl:flex-col">
          <div className="rounded-[10px] bg-overlay-panel p-4 backdrop-blur-[60px] xl:w-5/12">
            <div className="mb-2 flex w-full justify-between gap-2">
              <ButtonTab className="w-full" active={feature === collateral} label={"Deposit"} onClick={() => onTabClick("deposit")} />
              <ButtonTab className="w-full" active={feature === "borrow"} label={"Borrow"} onClick={() => onTabClick("borrow")} />
              <ButtonTab className="w-full" active={feature === "leverage"} label={"Leverage"} onClick={() => onTabClick("leverage")} />
            </div>
            <div className="mb-4 flex w-full justify-between gap-2">
              <ButtonTab className="w-full" active={feature === "repay"} label={"Repay"} onClick={() => onTabClick("repay")} />
              <ButtonTab className="w-full" active={feature === "withdraw"} label={"Withdraw"} onClick={() => onTabClick("withdraw")} />
              <ButtonTab className="w-full" active={feature === "liquidate"} label={"Liquidate"} onClick={() => onTabClick("liquidate")} />
            </div>

            <Divider />
            <div className="mt-5">{children}</div>
          </div>
          <div className="flex w-full flex-col gap-2 xl:w-7/12">
            <TgUsdCollateralPrice />
          </div>
        </div>
        <Divider />

        <Accordion className="w-full" type="single" collapsible>
          <BorderPanel className="flex w-full cursor-pointer items-center justify-between bg-overlay-panel px-2 backdrop-blur-[60px]">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <span className="text-md">vAPR Calculator</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex w-full flex-col items-center justify-center text-primary">
                  <div className="flex w-full items-start justify-start">
                    This calculator allows you to compute your position&lsquo;s net vAPR depending on USG&lsquo;s price. Note that the result will always be
                    accurate only for leveraged positions where all the debt has been converted to collateral. If you&lsquo;re using your debt to farm
                    elsewhere, you will need to regurlaly update your debt info (amount used to farm and vAPR) so the calculator display a correct result.
                  </div>

                  <div className="flex w-full">
                    <div className="mt-3 flex w-2/12 flex-col items-center justify-center">
                      <div className="flex w-full items-center justify-between rounded-[10px] bg-overlay-panel px-2 py-1 backdrop-blur-[60px]">
                        <span> Current vAPR</span>
                        <span className="flex items-center justify-center bg-button-active bg-clip-text font-semibold text-transparent">60.5%</span>
                      </div>

                      <div className="my-2 flex w-full items-center justify-end gap-1">
                        Leverage <Switch checked={isLeveraged} onCheckedChange={(v) => setIsLeveraged(v)} />
                      </div>

                      <div></div>
                    </div>

                    <div className="flex w-10/12"></div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </BorderPanel>
        </Accordion>

        <Divider />
        <TgUsdMarketInfo />

        <TgUsdPositionHistory />
      </div>
    </>
  )
}
