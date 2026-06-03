"use client"

import { useEffect } from "react"
import { USGLoanDetail } from "./usg_loan_detail"
import { MarketDetails } from "./header/market_details"
import { usePathname, useRouter } from "next/navigation"
import USGRecordPageHeader from "./usg_record_page_header"
import { useUSGRecordContext } from "./usg_record_context"
import { Divider } from "@/components/design_system/structure/divider"
import { USGCollateralPrice } from "./collat_price/collat_price_content"
import { USGPositionHistory } from "./position_history/usg_position_history"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { CollateralPriceProvider } from "./collat_price/collat_price_context"
import { MarketDetailsParameters } from "./header/components/market_details_parameters"
import { FeatureTabs } from "@/components/design_system/inputs/feature_tabs/feature_tabs"
import { MarketDetailsContracts } from "./header/components/market_details_contracts"

type USGRecordLayoutProps = {
  children: React.ReactNode
}

export default function USGRecordLayout({ children }: USGRecordLayoutProps) {
  const { feature, canLeverage, marketContracts, marketInfo, onChainData, setIsRepayAndWithdraw, setActiveTab, activeTab } = useUSGRecordContext()

  const marketPauseStruct = onChainData?.constants?.pauseStruct

  const router = useRouter()

  const path = usePathname()

  const onTabClick = (feat: string) => {
    if (feat.toLowerCase() === "deposit") {
      router.push(`/${marketInfo?.marketAddress}/deposit`)
    } else if (feat.toLowerCase() === "deposit&borrow") {
      router.push(`/${marketInfo?.marketAddress}/deposit-borrow`)
    } else if (feat.toLowerCase() === "repay") {
      router.push(`/${marketInfo?.marketAddress}/repay`)
    } else if (feat.toLowerCase() === "repay&withdraw") {
      router.push(`/${marketInfo?.marketAddress}/repay-withdraw`)
    } else {
      router.push(`/${marketInfo?.marketAddress}/${feat.toLowerCase()}`)
    }
  }

  const onClickBorrow = () => {
    setActiveTab("Borrow")
    router.push(`/${marketInfo?.marketAddress}/deposit-borrow`)
  }

  const onClickRepay = () => {
    setActiveTab("Repay")
    router.push(`/${marketInfo?.marketAddress}/repay-withdraw`)
  }

  const onTabClickLeverage = () => {
    if (canLeverage && process.env.NEXT_PUBLIC_IS_LEVERAGE_ON === "true") {
      onTabClick("leverage")
    }
  }

  const setupNavigationOnInit = () => {
    const lastIndexOfSlash = path?.lastIndexOf("/") + 1
    const feat = path.substring(lastIndexOfSlash, path.length)

    if (feat === "repay" || feat === "withdraw" || feat === "liquidate") {
      setIsRepayAndWithdraw(false)
      setActiveTab("Repay")
    }

    if (feat === "repay-withdraw") {
      setIsRepayAndWithdraw(true)
      setActiveTab("Repay")
    }
  }

  useEffect(() => {
    setupNavigationOnInit()
  }, [])

  return (
    <>
      <USGRecordPageHeader />

      <MarketDetailsParameters />

      <div className="mt-2 flex flex-col gap-4">
        <div className="relative flex items-start justify-start gap-5 max-xl:flex-col">
          <ReliefCard className="w-full p-5 xl:w-5/12">
            <FeatureTabs
              feature={feature}
              activeTab={activeTab}
              canLeverage={canLeverage}
              marketAddress={marketInfo?.marketAddress}
              isDepositPaused={marketPauseStruct?.isDepositPaused || false}
              isBorrowPaused={marketPauseStruct?.isBorrowPaused || false}
              isLeveragePaused={marketPauseStruct?.isLeveragePaused || false}
              onTabClick={onTabClick}
              onTabClickLeverage={onTabClickLeverage}
              onClickBorrow={onClickBorrow}
              onClickRepay={onClickRepay}
            ></FeatureTabs>

            <div className="mt-[10px]">{children}</div>
          </ReliefCard>

          <div className="flex w-full flex-col gap-5 self-start xl:sticky xl:top-24 xl:w-7/12">
            <USGLoanDetail />

            <CollateralPriceProvider>
              <USGCollateralPrice />
            </CollateralPriceProvider>
          </div>
        </div>

        <Divider />

        <MarketDetails />

        <MarketDetailsContracts marketContracts={marketContracts} />

        <Divider className="hidden md:flex" />

        <USGPositionHistory />
      </div>
    </>
  )
}
