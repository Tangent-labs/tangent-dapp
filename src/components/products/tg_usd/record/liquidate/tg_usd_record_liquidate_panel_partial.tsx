"use client"

import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { useTgUsdLiquidateContext } from "./tg_usd_record_liquidate_context"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import TokenImage from "@/components/design_system/structure/token_image"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import { formatBigInt, formatDollar } from "@/lib/number_formatter"
import Divider from "@/components/design_system/structure/divider"
import { formatUnits } from "viem"

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
          Max: {formatBigInt(maxLiquidable, 18, 2)} {collateralInfo?.symbol}
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
        depositAsset={collateralInfo}
        setMaxBalance={() => {}}
        balance={maxLiquidable}
        displayBalance={false}
        onValueChange={handleLiquidateValueChange}
      />

      <PanelRaw className={`${isQuoteLoading ? "shimmer" : ""} flex flex-col gap-1 p-2`}>
        <div className="flex justify-between">
          <div className="flex flex-col items-start justify-start">
            <div className="flex items-center justify-center text-subtitle">You redeem</div>
            <div className="flex items-center justify-center gap-2">
              <input
                type="string"
                placeholder="0"
                disabled={true}
                className="flex justify-start bg-transparent text-xl font-bold focus:outline-none"
                value={Number(formatUnits(tgUSDReceivedValue || 0n, 18)).toFixed(2) ?? ""}
              />

              <div className="text-xs">
                {tgUSDReceivedValue && tgUSDInfo?.price !== 0
                  ? `(~${formatDollar((Number(Number(formatUnits(tgUSDReceivedValue || 0n, 18))) * tgUSDInfo?.price).toFixed(2))})`
                  : ""}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <div>Minimum redeemed</div>
            </div>
          </div>
          <div className="mb-2 mt-auto flex items-center justify-center gap-2 rounded-xl border border-white/30 p-2">
            <TokenImage token={"tgUSD"} size={24} />
            <div className="font-bold">tgUSD</div>
          </div>
        </div>
      </PanelRaw>

      <Divider />

      <DepositInput
        depositAmount={repayWeiValue}
        labelDeposit="You repay"
        depositSelect={
          <div className="mb-2 mt-auto flex items-center justify-center gap-2 rounded-xl border border-white/30 p-2">
            <TokenImage token={"tgUSD"} size={24} />
            <div className="font-bold">tgUSD</div>
          </div>
        }
        disabled={!canInteract}
        displaySliderInput={true}
        percentage={repayablePercentage}
        setPercentage={setRepayablePercentage}
        depositAsset={tgUSDInfo}
        setMaxBalance={() => {}}
        balance={maxRepayable}
        displayBalance={false}
        onValueChange={(value: bigint | undefined) => {
          setRepayWeiValue(value)
        }}
      />
    </>
  )
}
