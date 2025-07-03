"use client"

import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import { useTgUsdLiquidateContext } from "./tg_usd_record_liquidate_context"
import TokenImage from "@/components/design_system/structure/token_image"
import Divider from "@/components/design_system/structure/divider"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { formatBigInt } from "@/lib/number_formatter"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { TgUsdStaticAssetSelector } from "./tg_usd_record_liquidate_panel"

export default function TgUsdLiquidatePanelPartial() {
  const { tgUSDInfo, collateralInfo } = useTgUsdRecordContext()

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
  } = useTgUsdLiquidateContext()

  const LiquidateAssetDisplay = () => {
    return (
      <BorderPanel className="flex items-center gap-2 bg-select-input p-2">
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
        <span className="text-[20px] font-semibold">Liquidate partial</span>
        <span className="text-xs text-subtitle">
          Max: {formatBigInt(maxLiquidable, 18, 2)} {collateralInfo?.symbol}
        </span>
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
        depositSelect={<TgUsdStaticAssetSelector />}
        disabled={true}
        displaySliderInput={false}
        depositAsset={tgUSDInfo}
        setMaxBalance={() => {}}
        onValueChange={() => {}}
        isLoading={isQuoteLoading}
        percentage={0}
        setPercentage={() => {}}
      />

      <Divider />

      <div className="flex w-full items-end justify-end">
        <span className="text-xs text-subtitle">Max: {formatBigInt(maxRepayable, 18, 2)} tgUSD</span>
      </div>

      <DepositInput
        depositAmount={repayWeiValue}
        labelDeposit="You repay"
        depositSelect={<TgUsdStaticAssetSelector />}
        disabled={!canInteract}
        displaySliderInput={true}
        percentage={repayablePercentage}
        setPercentage={setRepayablePercentage}
        depositAsset={tgUSDInfo}
        setMaxBalance={() => setRepayWeiValue(maxRepayable)}
        balance={maxRepayable}
        onValueChange={(value: bigint | undefined) => {
          setRepayWeiValue(value)
        }}
      />

      <DepositInput
        depositAmount={(tgUSDReceivedValue || 0n) - (repayWeiValue || 0n)}
        labelDeposit="You receive"
        depositSelect={<TgUsdStaticAssetSelector />}
        disabled={true}
        displaySliderInput={false}
        depositAsset={tgUSDInfo}
        setMaxBalance={() => {}}
        onValueChange={() => {}}
        isLoading={isQuoteLoading}
        percentage={0}
        setPercentage={() => {}}
      />
    </>
  )
}
