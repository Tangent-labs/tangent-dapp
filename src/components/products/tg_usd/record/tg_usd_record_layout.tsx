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

type TgUsdRecordLayoutProps = React.ButtonHTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
}

export default function TgUsdRecordLayout({ children, ...props }: TgUsdRecordLayoutProps) {
  const { collateral } = useTgUsdRecordContext()

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
      <div className="mt-4 flex h-full flex-col gap-4">
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

        <TgUsdMarketInfo />
      </div>
    </>
  )
}
