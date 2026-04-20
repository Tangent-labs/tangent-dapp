"use client"

import { ReactNode } from "react"
import { formatUnits } from "viem"
import { DynamicProgressBar } from "./dynamic-progress-bar"
import { usePredepositContext } from "../predeposit.context"
import { Button } from "@/components/design_system/inputs/button"
import { formatDollar, formatNumber } from "@/lib/number_formatter"
import { USGPredepositComponent } from "./usg-predeposit-component"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"

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
    setIsUSDGUSDCTransactionBlockedBySlippage,
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
  } = usePredepositContext()

  const { connect, isConnected, isWalletContextLoaded } = useWalletConnexionContext()

  let isDisplayYouAreNotWL = false
  // In private
  if (predepositStatus?.predepositState === "deposit_private") {
    // Show you are not WL only in private if an user is not WL
    isDisplayYouAreNotWL = predepositStatus.userState !== "private"
  }

  // Display the blurr when ( OR ) :
  //  - Wallet not connected
  //  - API is loading
  //  - Wallet Connected, predeposit in private and now WL
  //  - Wallet connected, privileges are OK but no signatures
  const isDisplayBlurry = !isConnected || isFetchApiInitialLoading || (isConnected && (isDisplayYouAreNotWL || !predepositStatus?.isSigned))

  return (
    <section className="mt-8 flex w-full flex-col">
      <div className="flex w-full items-center justify-between">
        <span className="text-lg font-semibold text-white">Total Deposit cap</span>

        <span className="flex items-center">
          <span className="text-button-active">
            $
            {formatNumber(
              Number(
                formatUnits(
                  (predepositStatus?.USGUSDCData.USGUSDCAccumulatedTotal || 0n) + (predepositStatus?.USGfrxUSDData.USGfrxUSDAccumulatedTotal || 0n),
                  18
                )
              ),
              0
            )}
          </span>

          {predepositStatus && (
            <span className="text-white">
              /
              {formatDollar(
                Number(formatUnits(predepositStatus?.USGUSDCData?.USGUSDCCap || 0n, 18)) +
                  Number(formatUnits(predepositStatus?.USGfrxUSDData?.USGfrxUSDCap || 0n, 18)),
                0
              )}
            </span>
          )}
        </span>
      </div>

      <DynamicProgressBar
        progressBarColor="bg-button-active"
        maxValue={(predepositStatus?.USGUSDCData?.USGUSDCCap || 0n) + (predepositStatus?.USGfrxUSDData?.USGfrxUSDCap || 0n)}
        currentValue={(predepositStatus?.USGUSDCData.USGUSDCAccumulatedTotal || 0n) + (predepositStatus?.USGfrxUSDData.USGfrxUSDAccumulatedTotal || 0n)}
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
            setIsTransactionBlockedBySlippage={setIsUSDGUSDCTransactionBlockedBySlippage}
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
