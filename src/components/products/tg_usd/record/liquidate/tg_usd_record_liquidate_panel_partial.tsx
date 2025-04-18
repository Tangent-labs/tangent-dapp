"use client"

import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { useTgUsdLiquidateContext } from "./tg_usd_record_liquidate_context"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import TokenImage from "@/components/design_system/structure/token_image"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"

export default function TgUsdLiquidatePanelPartial() {
  const { liquidateWeiValue, setLiquidateWeiValue, maxLiquidable, liquidablePercentage, setLiquidablePercentage } = useTgUsdLiquidateContext()
  const { tgUSDInfo, collateralInfo } = useTgUsdRecordContext()
  const { canInteract } = useWalletConnexionContext()

  const WithdrawAssetDisplay = () => {
    return (
      <PanelRaw className="flex w-48 items-center gap-2 border-white !bg-opacity-0 px-4 py-2 !backdrop-blur-none">
        <div className="">
          <TokenImage token={collateralInfo?.logo} size={32} />
        </div>
        <span className="flex flex-col text-lg leading-3">
          <span>{collateralInfo.symbol}</span>
        </span>
      </PanelRaw>
    )
  }

  return (
    <>
      <div className="flex w-full items-end justify-between">
        <span className="text-[20px] font-bold">Liquidate partial</span>
        <span className="text-xs text-subtitle">
          Max: {maxLiquidable} {collateralInfo?.symbol}
        </span>
      </div>

      <DepositInput
        depositAmount={liquidateWeiValue}
        labelDeposit="You liquidate"
        depositSelect={<WithdrawAssetDisplay />}
        disabled={!canInteract}
        displaySliderInput={true}
        percentage={liquidablePercentage}
        setPercentage={setLiquidablePercentage}
        depositAsset={tgUSDInfo}
        setMaxBalance={() => {}}
        displayBalance={false}
        onValueChange={(value: bigint | undefined) => {
          setLiquidateWeiValue(value)
        }}
      />
    </>
  )
}
