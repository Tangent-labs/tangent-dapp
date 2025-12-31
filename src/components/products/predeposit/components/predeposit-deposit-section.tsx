"use client"

import { formatUnits } from "viem"
import { ExistingAsset } from "@/types"
import { IconArrow } from "@/components/icons"
import { DynamicProgressBar } from "./dynamic-progress-bar"
import { usePredepositContext } from "../predeposit.context"
import { Button } from "@/components/design_system/inputs/button"
import { formatDollar, formatNumber } from "@/lib/number_formatter"
import { USGPredepositComponent } from "./usg-predeposit-component"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"

export const PredepositDepositSection = () => {
  const {
    USDCInfo,
    slippage,
    isLoading,
    frxUSDInfo,
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
    isWhitelisted,
    frxUSDslippage,
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
  } = usePredepositContext()

  const { connect, isConnected } = useWalletConnexionContext()

  return (
    <section className="mt-4 flex w-full flex-col">
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

      <div className="relative mt-6">
        <div className="flex w-full flex-col items-center justify-center gap-2 lg:flex-row">
          <USGPredepositComponent
            predepositStatus={predepositStatus}
            currentDeposit={predepositStatus?.USGUSDCData.USGUSDCAccumulatedTotal || 0n}
            slippage={slippage}
            setSlippage={setSlippage}
            depositWeiValue={USDCDepositValue}
            isLoading={isLoading}
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
            pool={predepositStatus?.USGUSDCData?.lpName as ExistingAsset}
            setMaxBalance={setDepositMaxUSGUSDC}
          />

          <USGPredepositComponent
            predepositStatus={predepositStatus}
            currentDeposit={predepositStatus?.USGfrxUSDData.USGfrxUSDAccumulatedTotal || 0n}
            slippage={frxUSDslippage}
            setSlippage={setfrxUSDSlippage}
            depositWeiValue={frxUSDDepositValue}
            isLoading={isLoading}
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
            pool={predepositStatus?.USGfrxUSDData?.lpName as ExistingAsset}
            setMaxBalance={setDepositMaxUSGfrxUSD}
          />
        </div>

        {!isConnected && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[12px] bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-[10px] p-6 text-center">
              <span className="text-2xl font-semibold text-white lg:text-4xl">Pre-deposit campaign</span>

              <Button onClick={connect} className="flex h-10 items-center justify-center">
                Connect wallet
              </Button>

              <span className="flex items-center justify-center gap-1 text-sm text-subtitle">
                Frequently Asked Questions <IconArrow className="w-3"></IconArrow>
              </span>
            </div>
          </div>
        )}

        {isConnected && !isWhitelisted && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[12px] bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-[10px] p-6 text-center">
              <span className="text-2xl font-semibold text-white lg:text-4xl">Pre-deposit campaign</span>

              <Button state="disabled" className="flex h-10 items-center justify-center">
                You are not whitelisted
              </Button>

              <span className="flex items-center justify-center gap-1 text-sm text-subtitle">
                Frequently Asked Questions <IconArrow className="w-3"></IconArrow>
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
