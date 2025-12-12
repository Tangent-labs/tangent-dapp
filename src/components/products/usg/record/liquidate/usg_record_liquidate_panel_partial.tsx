"use client"

import { formatBigInt } from "@/lib/number_formatter"
import { useUSGRecordContext } from "../usg_record_context"
import Divider from "@/components/design_system/structure/divider"
import { useUSGLiquidateContext } from "./usg_record_liquidate_context"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { USGStaticAssetSelector } from "@/components/design_system/structure/usg_static_selector"
import { CustomCollatAssetDisplay } from "@/components/design_system/structure/custom_collat_asset_display"

export default function USGLiquidatePanelPartial() {
  const { USGInfo, collateralInfo } = useUSGRecordContext()

  const { canInteract } = useWalletConnexionContext()

  const {
    setRepayWeiValue,
    setLiquidablePercentage,
    handleLiquidateValueChange,
    setRepayablePercentage,
    liquidateWeiValue,
    maxLiquidable,
    liquidablePercentage,
    isQuoteLoading,
    USGReceivedValue,
    repayWeiValue,
    repayablePercentage,
    maxRepayable,
    maxLiquidateString,
  } = useUSGLiquidateContext()

  const LiquidateAssetDisplay = () => {
    return <CustomCollatAssetDisplay collateralInfo={collateralInfo} />
  }

  return (
    <>
      <div className="flex w-full items-end justify-between">
        <span className="text-sm font-semibold md:text-xl">Liquidate partial</span>
        <span className="text-xs text-subtitle">{maxLiquidateString}</span>
      </div>

      <DepositInput
        depositAmount={liquidateWeiValue}
        labelDeposit="You liquidate"
        depositSelect={<LiquidateAssetDisplay />}
        disabled={!canInteract}
        displaySliderInput={true}
        percentage={liquidablePercentage}
        setPercentage={setLiquidablePercentage}
        depositAsset={collateralInfo}
        setMaxBalance={() => handleLiquidateValueChange(maxLiquidable)}
        balance={maxLiquidable}
        onValueChange={handleLiquidateValueChange}
      />

      <DepositInput
        depositAmount={USGReceivedValue}
        labelDeposit="For"
        depositSelect={<USGStaticAssetSelector />}
        disabled={true}
        displaySliderInput={false}
        depositAsset={USGInfo}
        setMaxBalance={() => {}}
        onValueChange={() => {}}
        isLoading={isQuoteLoading}
        percentage={0}
        setPercentage={() => {}}
      />

      <Divider />

      <div className="flex w-full items-end justify-end">
        <span className="text-xs text-subtitle">Max: {formatBigInt(maxRepayable, 18, 2)} USG</span>
      </div>

      <DepositInput
        depositAmount={repayWeiValue}
        labelDeposit="You repay"
        depositSelect={<USGStaticAssetSelector />}
        disabled={!canInteract}
        displaySliderInput={true}
        percentage={repayablePercentage}
        setPercentage={setRepayablePercentage}
        depositAsset={USGInfo}
        setMaxBalance={() => setRepayWeiValue(maxRepayable)}
        balance={maxRepayable}
        onValueChange={(value: bigint | undefined) => {
          setRepayWeiValue(value)
        }}
      />

      <DepositInput
        depositAmount={(USGReceivedValue || 0n) - (repayWeiValue || 0n)}
        labelDeposit="You receive"
        depositSelect={<USGStaticAssetSelector />}
        disabled={true}
        displaySliderInput={false}
        depositAsset={USGInfo}
        setMaxBalance={() => {}}
        onValueChange={() => {}}
        isLoading={isQuoteLoading}
        percentage={0}
        setPercentage={() => {}}
      />
    </>
  )
}
