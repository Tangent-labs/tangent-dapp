"use client"

import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import TokenImage from "@/components/design_system/structure/token_image"
import Divider from "@/components/design_system/structure/divider"
import { useUSGRecordContext } from "../tg_usd_record_context"
import { formatBigInt } from "@/lib/number_formatter"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { USGStaticAssetSelector } from "./usg_record_liquidate_panel"
import { useUSGLiquidateContext } from "./usg_record_liquidate_context"

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
    tgUSDReceivedValue,
    repayWeiValue,
    repayablePercentage,
    maxRepayable,
    maxLiquidateString,
  } = useUSGLiquidateContext()

  const LiquidateAssetDisplay = () => {
    return (
      <BorderPanel className="flex items-center gap-2 bg-select-input px-2.5 py-2">
        <TokenImage token={collateralInfo?.logo} size={32} />

        <span className="flex flex-col text-sm font-semibold">
          <span>{collateralInfo.symbol}</span>
        </span>
      </BorderPanel>
    )
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
        depositAmount={tgUSDReceivedValue}
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
        depositAmount={(tgUSDReceivedValue || 0n) - (repayWeiValue || 0n)}
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
