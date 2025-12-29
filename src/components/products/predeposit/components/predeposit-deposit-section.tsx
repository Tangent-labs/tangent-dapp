"use client"

import { formatUnits } from "viem"
import { IconArrow } from "@/components/icons"
import { StaticAssetSelector } from "./usdc-selector"
import { DynamicProgressBar } from "./dynamic-progress-bar"
import { usePredepositContext } from "../predeposit.context"
import { Button } from "@/components/design_system/inputs/button"
import FormButtons from "@/components/design_system/form/form_actions"
import TokenImage from "@/components/design_system/structure/token_image"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { formatBigIntAsNumber, formatDollar, formatNumber } from "@/lib/number_formatter"

type PredepositDepositSectionProps = {
  totalDeposited: bigint
  usgUsdcDeposited: bigint
  usdFrxUSDDeposited: bigint
}

export const PredepositDepositSection = ({ totalDeposited, usgUsdcDeposited, usdFrxUSDDeposited }: PredepositDepositSectionProps) => {
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
    actionApproveUSGUSDC,
    actionDepositUSGUSDC,
    setSlippage,
    handleDepositChange,
    handleDepositfrxUSDChange,
    setUSDCDepositSliderPercent,
    setfrxUSDDepositSliderPercent,
    actionApproveUSGfrxUSD,
    actionDepositUSGfrxUSD,
    predepositStatus,
    isWhitelisted,
  } = usePredepositContext()

  const { connect, isConnected } = useWalletConnexionContext()

  return (
    <section className="mt-4 flex w-full flex-col">
      <div className="flex w-full items-center justify-between">
        <span className="text-lg font-semibold text-white">Total Deposit cap</span>
        <span className="flex items-center">
          <span className="text-button-active">${formatNumber(Number(formatUnits(totalDeposited, 18)), 0)}</span>

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
        currentValue={totalDeposited}
      ></DynamicProgressBar>

      <div className="relative mt-6">
        {/* Your existing full section */}
        <div className="flex w-full flex-col items-center justify-center gap-2 lg:flex-row">
          {/* First panel - USG-USDC */}
          <div className="flex w-full flex-col rounded-[10px] bg-overlay-panel p-4 backdrop-blur-[60px]">
            <div className="mb-2 flex w-full items-center justify-between">
              <span className="font-semibold text-white">Deposit cap</span>
              <span className="flex items-center">
                <span className="text-white">${formatNumber(Number(formatUnits(BigInt(usgUsdcDeposited || 0n), 18)), 0)}</span>

                {predepositStatus && (
                  <span className="text-subtitle"> /{formatDollar(Number(formatUnits(predepositStatus?.USGUSDCData?.USGUSDCCap || 0n, 18)))}</span>
                )}
              </span>
            </div>

            <div className="mb-2 flex w-full items-center justify-center gap-2">
              <DynamicProgressBar progressBarColor="bg-white" maxValue={predepositStatus?.USGUSDCData?.USGUSDCCap || 0n} currentValue={usgUsdcDeposited} />

              <SlippageInput slippage={slippage} setSlippage={setSlippage} />
            </div>

            <DepositInput
              displaySliderInput={true}
              depositAmount={USDCDepositValue}
              depositSelect={<StaticAssetSelector asset="USDC" />}
              isLoading={isLoading}
              depositAsset={USDCInfo}
              balance={USDCBalanceAllowance?.balance}
              isZapping={false}
              onValueChange={handleDepositChange}
              percentage={USDCDepositSliderPercent}
              setPercentage={setUSDCDepositSliderPercent}
              setMaxBalance={() => {}}
            />

            <div className={`${isLoading ? "shimmer" : ""} my-2 flex flex-col gap-1 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]`}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start justify-start">
                  <div className="flex items-center justify-center text-xs font-semibold text-subtitle">You receive</div>
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="number"
                      disabled={isLoading}
                      readOnly={true}
                      className="auto-grow bg-transparent text-[24px] font-semibold focus:outline-none"
                      value={USGUSDCInnerValue ?? ""}
                    />
                  </div>
                </div>
                <BorderPanel className="flex items-center justify-center gap-2 bg-select-input px-2.5 py-2">
                  <TokenImage token="USG-USDC" size={32} />
                  <div className="font-semibold">USG-USDC</div>
                </BorderPanel>
              </div>
            </div>

            <FormButtons
              actions={{
                handleApprove: actionApproveUSGUSDC,
                handleProcess: actionDepositUSGUSDC,
              }}
              connect={connect}
              formState={USGUSDCformState}
              labelProcess="Deposit"
            />
          </div>

          {/* Second panel - USG-frxUSD */}
          <div className="flex w-full flex-col rounded-[10px] bg-overlay-panel p-4 backdrop-blur-[60px]">
            <div className="mb-2 flex w-full items-center justify-between">
              <span className="font-semibold text-white">Deposit cap</span>
              <span className="flex items-center">
                <span className="text-white">${formatNumber(Number(formatUnits(BigInt(usdFrxUSDDeposited || 0n), 18)), 0)}</span>
                <span className="text-subtitle"> /{formatBigIntAsNumber(predepositStatus?.USGfrxUSDData?.USGfrxUSDCap || 0n, 18, 0)}</span>
              </span>
            </div>

            <div className="mb-2 flex w-full items-center justify-center gap-2">
              <DynamicProgressBar
                progressBarColor="bg-white"
                maxValue={predepositStatus?.USGfrxUSDData?.USGfrxUSDCap || 0n}
                currentValue={usdFrxUSDDeposited}
              />

              <SlippageInput slippage={slippage} setSlippage={setSlippage} />
            </div>

            <DepositInput
              displaySliderInput={true}
              depositAmount={frxUSDDepositValue}
              depositSelect={<StaticAssetSelector asset="frxUSD" />}
              isLoading={isLoading}
              depositAsset={frxUSDInfo}
              balance={frxUSDBalanceAllowance?.balance}
              isZapping={false}
              onValueChange={handleDepositfrxUSDChange}
              percentage={frxUSDDepositSliderPercent}
              setPercentage={setfrxUSDDepositSliderPercent}
              setMaxBalance={() => {}}
            />

            <div className={`${isLoading ? "shimmer" : ""} my-2 flex flex-col gap-1 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]`}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start justify-start">
                  <div className="flex items-center justify-center text-xs font-semibold text-subtitle">You receive</div>
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="number"
                      disabled={isLoading}
                      readOnly={true}
                      className="auto-grow bg-transparent text-[24px] font-semibold focus:outline-none"
                      value={USGfrxUSDInnerValue ?? ""}
                    />
                  </div>
                </div>
                <BorderPanel className="flex items-center justify-center gap-2 bg-select-input px-2.5 py-2">
                  <TokenImage token="USG-frxUSD" size={32} />
                  <div className="font-semibold">USG-frxUSD</div>
                </BorderPanel>
              </div>
            </div>

            <FormButtons
              actions={{
                handleApprove: actionApproveUSGfrxUSD,
                handleProcess: actionDepositUSGfrxUSD,
              }}
              connect={connect}
              formState={USGfrxUSDformState}
              labelProcess="Deposit"
            />
          </div>
        </div>

        {!isConnected && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[12px] bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-[10px] p-6 text-center">
              <span className="text-4xl font-semibold text-white">Pre-deposit campaign</span>

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
              <span className="text-4xl font-semibold text-white">Pre-deposit campaign</span>

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
