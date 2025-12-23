"use client"

import { formatNumber } from "@/lib/number_formatter"
import { formatUnits } from "viem"
import { DynamicProgressBar } from "./dynamic-progress-bar"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import { usePredepositContext } from "../predeposit.context"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import { StaticAssetSelector } from "./usdc-selector"
import BorderPanel from "@/components/design_system/structure/border_panel"
import TokenImage from "@/components/design_system/structure/token_image"

type PredepositDepositSectionProps = {
  totalDeposited: bigint
  usgUsdcDeposited: bigint
  usdFrxUSDDeposited: bigint
}

const CAP = 10_000_000n * 10n ** 18n
const SUB_CAP = 5_000_000n * 10n ** 18n

export const PredepositDepositSection = ({ totalDeposited, usgUsdcDeposited, usdFrxUSDDeposited }: PredepositDepositSectionProps) => {
  const {
    setSlippage,
    handleDepositChange,
    setUSDCDepositSliderPercent,
    setfrxUSDDepositSliderPercent,
    USDCInfo,
    slippage,
    isLoading,
    frxUSDInfo,
    USGfrxUSDDepositValue,
    USDCDepositSliderPercent,
    frxUSDDepositSliderPercent,
    USDCBalance,
    frxUSDBalance,
    USDCDepositValue,
    USGUSDCInnerValue,
    USGfrxUSDInnerValue,
  } = usePredepositContext()

  return (
    <section className="mt-4 flex w-full flex-col">
      <div className="flex w-full items-center justify-between">
        <span className="text-lg font-semibold text-white">Total Deposit cap</span>
        <span className="flex items-center">
          <span className="text-button-active">${formatNumber(Number(formatUnits(totalDeposited, 18)), 0)}</span>
          <span className="text-white"> /$10,000,000</span>
        </span>
      </div>

      <DynamicProgressBar progressBarColor="bg-button-active" maxValue={CAP} currentValue={totalDeposited}></DynamicProgressBar>

      <div className="mt-4 flex w-full flex-col items-center justify-center gap-2 lg:flex-row">
        <div className="flex w-full flex-col rounded-[10px] bg-overlay-panel p-4 backdrop-blur-[60px]">
          <div className="mb-2 flex w-full items-center justify-between">
            <span className="font-semibold text-white">Deposit cap</span>
            <span className="flex items-center">
              <span className="text-white">${formatNumber(Number(formatUnits(usgUsdcDeposited, 18)), 0)}</span>
              <span className="text-subtitle"> /$5,000,000</span>
            </span>
          </div>

          <div className="mb-2 flex w-full items-center justify-center gap-2">
            <DynamicProgressBar progressBarColor="bg-white" maxValue={SUB_CAP} currentValue={usgUsdcDeposited}></DynamicProgressBar>

            <SlippageInput slippage={slippage} setSlippage={setSlippage}></SlippageInput>
          </div>

          <DepositInput
            displaySliderInput={true}
            depositAmount={USDCDepositValue}
            depositSelect={<StaticAssetSelector asset="USDC" />}
            isLoading={isLoading}
            depositAsset={USDCInfo}
            balance={USDCBalance}
            isZapping={false}
            onValueChange={handleDepositChange}
            percentage={USDCDepositSliderPercent}
            setPercentage={setUSDCDepositSliderPercent}
            setMaxBalance={() => {}}
          />

          <div className={`${isLoading ? "shimmer" : ""} mt-2 flex flex-col gap-1 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]`}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-start justify-start">
                <div className="flex items-center justify-center text-xs font-semibold text-subtitle">You receive</div>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    disabled={isLoading}
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
        </div>

        <div className="flex w-full flex-col rounded-[10px] bg-overlay-panel p-4 backdrop-blur-[60px]">
          <div className="mb-2 flex w-full items-center justify-between">
            <span className="font-semibold text-white">Deposit cap</span>
            <span className="flex items-center">
              <span className="text-white">${formatNumber(Number(formatUnits(usdFrxUSDDeposited, 18)), 0)}</span>
              <span className="text-subtitle"> /$5,000,000</span>
            </span>
          </div>

          <div className="mb-2 flex w-full items-center justify-center gap-2">
            <DynamicProgressBar progressBarColor="bg-white" maxValue={SUB_CAP} currentValue={usdFrxUSDDeposited}></DynamicProgressBar>

            <SlippageInput slippage={slippage} setSlippage={setSlippage}></SlippageInput>
          </div>

          <DepositInput
            displaySliderInput={true}
            depositAmount={USGfrxUSDDepositValue}
            depositSelect={<StaticAssetSelector asset="frxUSD" />}
            isLoading={isLoading}
            depositAsset={frxUSDInfo}
            balance={frxUSDBalance}
            isZapping={false}
            onValueChange={() => {}}
            percentage={frxUSDDepositSliderPercent}
            setPercentage={setfrxUSDDepositSliderPercent}
            setMaxBalance={() => {}}
          />

          <div className={`${isLoading ? "shimmer" : ""} mt-2 flex flex-col gap-1 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]`}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-start justify-start">
                <div className="flex items-center justify-center text-xs font-semibold text-subtitle">You receive</div>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="number"
                    disabled={isLoading}
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
        </div>
      </div>
    </section>
  )
}
