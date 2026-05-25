"use client"

import { formatUnits } from "viem"
import { IconCircleHelp } from "@/components/icons"
import { ReactNode, useEffect, useState } from "react"
import { DynamicProgressBar } from "./dynamic-progress-bar"
import { usePredepositContext } from "../predeposit.context"
import { Button } from "@/components/design_system/inputs/button"
import { formatDollar, formatNumber } from "@/lib/number_formatter"
import { USGPredepositComponent } from "./usg-predeposit-component"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

type BlurrySectionProps = {
  children: ReactNode
  scrollToFaq: () => void
}

const BlurrySection = ({ children, scrollToFaq }: BlurrySectionProps) => {
  return (
    <div className="absolute inset-0 z-10 flex items-start justify-center rounded-[9px] bg-black/70 backdrop-blur-sm xl:items-center">
      <div className="flex flex-col items-center gap-4 rounded-[10px] p-6 text-center">
        <span className="text-2xl font-semibold text-white lg:text-4xl">Pre-deposit campaign</span>

        {children}

        <span
          onClick={scrollToFaq}
          className="flex cursor-pointer items-center justify-center gap-1 text-sm text-subtitle transition hover:text-white hover:underline"
        >
          Frequently Asked Questions
        </span>
      </div>
    </div>
  )
}

type PredepositDepositSectionProps = {
  scrollToFaq: () => void
}

export const PredepositDepositSection = ({ scrollToFaq }: PredepositDepositSectionProps) => {
  const {
    USDCInfo,
    slippage,
    isfrxUSDDepositLoading,
    isUSDCDepositLoading,
    frxUSDInfo,
    isQuoteLoading,
    isfrxUSDQuoteLoading,
    USDCBalanceAllowance,
    frxUSDBalanceAllowance,
    USDCDepositValue,
    USGUSDCInnerValue,
    USGfrxUSDInnerValue,
    frxUSDDepositValue,
    USDCDepositSliderPercent,
    frxUSDDepositSliderPercent,
    USGUSDCformState,
    USGfrxUSDformState,
    predepositStatus,
    frxUSDslippage,
    projectedUSDCTANAllocation,
    projectedfrxUSDTANAllocation,
    minUSGUSDCReceived,
    minUSGfrxUSDReceived,
    isUSGUSDCTransactionBlockedBySlippage,
    USGUSDCSlippageLoss,
    isUSGfrxUSDTransactionBlockedBySlippage,
    USGfrxUSDSlippageLoss,
    setIsUSGfrxUSDTransactionBlockedBySlippage,
    setIsUSGUSDCTransactionBlockedBySlippage,
    setfrxUSDSlippage,
    actionApproveUSGUSDC,
    actionDepositUSGUSDC,
    setSlippage,
    handleDepositChange,
    handleDepositfrxUSDChange,
    setUSDCDepositSliderPercent,
    setfrxUSDDepositSliderPercent,
    actionApproveUSGfrxUSD,
    actionDepositUSGfrxUSD,
    setDepositMaxUSGUSDC,
    setDepositMaxUSGfrxUSD,
    signMessage,
    isFetchApiInitialLoading,
    isSigningLoading,
    isDisplayYouAreNotWL,
    isDisplayBlurry,
    eligibleDepositsTotal,
    predepositCap,
    totalDepositsUsd,
    totalDepositsWei,
    eligibleDepositsPercentage,
    totalDepositsPercentage,
  } = usePredepositContext()

  const [dynamicPercentages, setDynamicPercentages] = useState({ eligible: 0, total: 0 })

  useEffect(() => {
    const t = setTimeout(() => {
      setDynamicPercentages({ eligible: eligibleDepositsPercentage, total: totalDepositsPercentage })
    }, 100)
    return () => clearTimeout(t)
  }, [eligibleDepositsPercentage, totalDepositsPercentage])

  const { connect, isConnected, isWalletContextLoaded } = useWalletConnexionContext()

  return (
    <section className="mt-6 flex w-full flex-col">
      <div className="px-3">
        <div className="relative hidden h-5 w-full text-sm xl:flex">
          {predepositStatus && (
            <span
              className="absolute bottom-0 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap transition-all duration-1000 ease-out"
              style={{ left: `${dynamicPercentages.eligible}%` }}
            >
              <HoverCard openDelay={50} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <button type="button" className="inline-flex items-center">
                    <IconCircleHelp className="w-3 fill-subtitle" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent side="top" align="center" className="z-[1001] w-fit max-w-80 p-2 text-xs">
                  Deposits eligible for TAN rewards:{" "}
                  <span className="text-button-active">${formatNumber(Number(formatUnits(eligibleDepositsTotal, 18)), 0)}</span>
                </HoverCardContent>
              </HoverCard>
              <span className="text-subtitle">Eligible deposits</span>
            </span>
          )}

          {totalDepositsUsd !== null && (
            <span
              className="absolute bottom-0 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap transition-all duration-1000 ease-out"
              style={{ left: `${dynamicPercentages.total}%` }}
            >
              <HoverCard openDelay={50} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <button type="button" className="inline-flex items-center">
                    <IconCircleHelp className="w-3 fill-subtitle" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent side="top" align="center" className="z-[1001] w-fit max-w-64 p-2 text-xs">
                  Total deposits in Curve pools: <span className="text-button-active">{formatDollar(totalDepositsUsd, 0)}</span>
                </HoverCardContent>
              </HoverCard>
              <span className="text-subtitle">Total deposits</span>
            </span>
          )}

          {predepositStatus && (
            <span className="absolute bottom-0 right-0 flex items-center text-[15px]">
              <span className="text-button-active">${formatNumber(Number(formatUnits(eligibleDepositsTotal, 18)), 0)}</span>
              <span className="text-white">/{formatDollar(Number(formatUnits(predepositCap, 18)), 0)}</span>
            </span>
          )}
        </div>
      </div>

      <span className="flex w-full items-center justify-end text-sm xl:hidden">
        <span className="text-button-active">${formatNumber(Number(formatUnits(eligibleDepositsTotal, 18)), 0)}</span>

        {predepositStatus && <span className="text-white">/{formatDollar(Number(formatUnits(predepositCap, 18)), 0)}</span>}
      </span>

      <DynamicProgressBar
        progressBarColor="bg-button-active"
        secondaryColor="bg-button-active"
        maxValue={predepositCap}
        currentValue={eligibleDepositsTotal}
        secondaryValue={totalDepositsWei}
      ></DynamicProgressBar>

      <div className="relative mt-[10px]">
        <div className="flex w-full flex-col items-start justify-center gap-[10px] lg:flex-row">
          <USGPredepositComponent
            predepositStatus={predepositStatus}
            currentDeposit={predepositStatus?.USGUSDCData.USGUSDCAccumulatedTotal || 0n}
            slippage={slippage}
            setSlippage={setSlippage}
            depositWeiValue={USDCDepositValue}
            isLoading={isUSDCDepositLoading}
            isQuoteLoading={isQuoteLoading}
            assetInfo={USDCInfo}
            balance={USDCBalanceAllowance?.balance}
            handleDepositChange={handleDepositChange}
            percentage={USDCDepositSliderPercent}
            setPercentage={setUSDCDepositSliderPercent}
            innerValue={USGUSDCInnerValue}
            formState={USGUSDCformState}
            handleApprove={actionApproveUSGUSDC}
            handleProcess={actionDepositUSGUSDC}
            cap={predepositStatus?.USGUSDCData?.USGUSDCCap}
            connect={connect}
            pool={predepositStatus?.USGUSDCData?.lpName ?? ""}
            setMaxBalance={setDepositMaxUSGUSDC}
            tanAllocation={projectedUSDCTANAllocation}
            minValueReceived={minUSGUSDCReceived}
            isTransactionBlockedBySlippage={isUSGUSDCTransactionBlockedBySlippage}
            setIsTransactionBlockedBySlippage={setIsUSGUSDCTransactionBlockedBySlippage}
            slippageLoss={USGUSDCSlippageLoss}
          />

          <USGPredepositComponent
            predepositStatus={predepositStatus}
            currentDeposit={predepositStatus?.USGfrxUSDData.USGfrxUSDAccumulatedTotal || 0n}
            slippage={frxUSDslippage}
            setSlippage={setfrxUSDSlippage}
            depositWeiValue={frxUSDDepositValue}
            isLoading={isfrxUSDDepositLoading}
            isQuoteLoading={isfrxUSDQuoteLoading}
            assetInfo={frxUSDInfo}
            balance={frxUSDBalanceAllowance?.balance}
            handleDepositChange={handleDepositfrxUSDChange}
            percentage={frxUSDDepositSliderPercent}
            setPercentage={setfrxUSDDepositSliderPercent}
            innerValue={USGfrxUSDInnerValue}
            formState={USGfrxUSDformState}
            handleApprove={actionApproveUSGfrxUSD}
            handleProcess={actionDepositUSGfrxUSD}
            cap={predepositStatus?.USGfrxUSDData?.USGfrxUSDCap}
            connect={connect}
            pool={predepositStatus?.USGfrxUSDData?.lpName ?? ""}
            setMaxBalance={setDepositMaxUSGfrxUSD}
            tanAllocation={projectedfrxUSDTANAllocation}
            minValueReceived={minUSGfrxUSDReceived}
            isTransactionBlockedBySlippage={isUSGfrxUSDTransactionBlockedBySlippage}
            setIsTransactionBlockedBySlippage={setIsUSGfrxUSDTransactionBlockedBySlippage}
            slippageLoss={USGfrxUSDSlippageLoss}
          />
        </div>

        {isDisplayBlurry && (
          <BlurrySection scrollToFaq={scrollToFaq}>
            {/* When not connected, propose to connect after the loading of the wallet context */}
            {!isConnected && isWalletContextLoaded && (
              <Button onClick={connect} className="flex h-10 items-center justify-center">
                Connect wallet
              </Button>
            )}

            {/* Wallet connected, api in fetching, 2 scenarios : 
                - User not WL and we are in private, is prio compare to signMessage
                - User WL or in public, signauture needed
            */}

            {!isFetchApiInitialLoading &&
              isConnected &&
              (predepositStatus?.predepositState === "deposit_private" && isDisplayYouAreNotWL ? (
                <Button state="disabled" className="flex h-10 items-center justify-center">
                  You are not whitelisted
                </Button>
              ) : (
                <Button
                  onClick={() => signMessage()}
                  state={isSigningLoading ? "disabled" : "active"}
                  className="flex h-10 items-center justify-center"
                  hasLoadingState={true}
                  isLoading={isSigningLoading}
                >
                  Sign the message
                </Button>
              ))}
          </BlurrySection>
        )}
      </div>
    </section>
  )
}
