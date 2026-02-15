"use client"

import { formatUnits } from "viem"
import { PredepositStatus } from "../types/types"
import { StaticAssetSelector } from "./usdc-selector"
import { DynamicProgressBar } from "./dynamic-progress-bar"
import { formatDollar, formatNumber } from "@/lib/number_formatter"
import { AssetDataPriced, ExistingAsset, FormState } from "@/types"
import FormButtons from "@/components/design_system/form/form_actions"
import TokenImage from "@/components/design_system/structure/token_image"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import { ReliefCard } from "@/components/design_system/structure/relief_card"

type USGPredepositComponentProps = {
  predepositStatus: PredepositStatus | null
  currentDeposit: bigint
  slippage: number
  setSlippage: (n: number) => void
  depositWeiValue: bigint | undefined
  isLoading: boolean
  assetInfo: AssetDataPriced
  balance: bigint
  handleDepositChange: (arg: bigint | undefined) => void
  percentage: number
  setPercentage: (n: number) => void
  innerValue: number
  formState: FormState
  handleApprove: () => void
  handleProcess: () => void
  cap: bigint | undefined
  connect: () => void
  pool: ExistingAsset
  setMaxBalance: () => void
  tanAllocation: bigint
}

export const USGPredepositComponent = ({
  predepositStatus,
  currentDeposit,
  slippage,
  setSlippage,
  depositWeiValue,
  isLoading,
  assetInfo,
  balance,
  handleDepositChange,
  percentage,
  setPercentage,
  innerValue,
  formState,
  handleApprove,
  handleProcess,
  cap,
  connect,
  pool,
  setMaxBalance,
  tanAllocation,
}: USGPredepositComponentProps) => {
  return (
    <ReliefCard className="flex w-full flex-col rounded-[10px] bg-overlay-panel p-4 backdrop-blur-[60px]">
      <div className="mb-2 flex w-full items-center justify-between">
        <span className="font-semibold text-white">Deposit cap</span>
        <span className="flex items-center">
          <span className="text-white">${formatNumber(Number(formatUnits(BigInt(currentDeposit || 0n), 18)), 0)}</span>

          {predepositStatus && <span className="text-subtitle"> /{formatDollar(Number(formatUnits(cap || 0n, 18)))}</span>}
        </span>
      </div>

      <div className="mb-2 flex w-full items-center justify-center gap-2">
        <DynamicProgressBar progressBarColor="bg-white" maxValue={cap || 0n} currentValue={currentDeposit} />

        <SlippageInput slippage={slippage} setSlippage={setSlippage} />
      </div>

      <DepositInput
        displaySliderInput={true}
        depositAmount={depositWeiValue}
        depositSelect={<StaticAssetSelector asset={assetInfo?.symbol as ExistingAsset} />}
        isLoading={isLoading}
        depositAsset={assetInfo}
        balance={balance}
        isZapping={false}
        onValueChange={handleDepositChange}
        percentage={percentage}
        setPercentage={setPercentage}
        setMaxBalance={setMaxBalance}
        displayBalance={true}
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
                value={innerValue ?? ""}
              />
            </div>
          </div>
          <BorderPanel className="flex items-center justify-center gap-2 bg-select-input px-2.5 py-2">
            <TokenImage token={pool} size={32} />
            <div className="text-sm font-semibold">{pool}</div>
          </BorderPanel>
        </div>
      </div>

      <div className="flex w-full items-center justify-between rounded-[10px] bg-overlay-panel px-3 py-1 backdrop-blur-[60px]">
        <span className="text-xs font-semibold text-subtitle">TAN allocation</span>
        <span className="flex items-center justify-center gap-2 text-xl font-semibold">
          {formatNumber(Number(tanAllocation), 0)}
          <TokenImage token="tan" size={12} className="w-4" />
        </span>
      </div>

      <span className="my-2 flex h-4 w-full items-center justify-center">
        {formState?.cantProcessReasons?.length > 0 && <span className="text-sm font-semibold text-danger"> {formState?.cantProcessReasons[0]} </span>}
      </span>

      <FormButtons
        actions={{
          handleApprove: handleApprove,
          handleProcess: handleProcess,
        }}
        connect={connect}
        formState={formState}
        labelProcess="Deposit"
      />
    </ReliefCard>
  )
}
