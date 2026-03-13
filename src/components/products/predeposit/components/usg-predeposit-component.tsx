"use client"

import { formatUnits } from "viem"
import { PredepositStatus } from "../types/types"
import { DynamicProgressBar } from "./dynamic-progress-bar"
import { formatDollar, formatNumber } from "@/lib/number_formatter"
import { AssetDataPriced, FormState } from "@/types"
import FormButtons from "@/components/design_system/form/form_actions"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { BorderPanel } from "@/components/design_system/structure/border_panel"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "./StaticCardAssetInput"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { SlippageInput } from "@/components/design_system/inputs/slippage"

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
  pool: string
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
    <ReliefCard className="flex w-full flex-col p-2 xl:p-4">
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

      <GenericInputAssetAmount
        inputWeiValue={depositWeiValue}
        depositSelect={<StaticCardAssetInput asset={assetInfo?.symbol} />}
        isLoading={isLoading}
        label="You deposit"
        asset={assetInfo}
        isZapping={false}
        onValueChange={handleDepositChange}
        displayBalance={true}
        maxAmountParams={{ maxWeiValue: balance, setMaxAmount: setMaxBalance }}
        sliderParams={{
          sliderPercentage: percentage,
          setSliderPercentage: setPercentage,
        }}
      />

      <div className={`${isLoading ? "shimmer" : ""} my-2 flex flex-col gap-1 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]`}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start justify-start">
            <div className="flex items-center justify-center text-xs font-semibold text-subtitle">You receive</div>
            <input
              type="number"
              disabled={isLoading}
              readOnly={true}
              className="w-full max-w-36 bg-transparent text-[24px] font-semibold focus:outline-none"
              value={innerValue ?? ""}
            />
          </div>
          <BorderPanel className="flex items-center justify-center gap-2 bg-select-input px-2.5 py-2">
            <TokenImage token={pool} size={32} />
            <div className="text-sm font-semibold">{pool?.replaceAll("-", "/")}</div>
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
        isLoading={isLoading}
      />
    </ReliefCard>
  )
}
