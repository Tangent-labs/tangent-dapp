"use client"

import React from "react"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { DepositReceiveInput } from "@/components/design_system/inputs/deposit_recieve_input"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { useTgUsdWithdrawContext } from "./tg_usd_record_withdraw_context"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import TokenImage from "@/components/design_system/structure/token_image"
import { formatBigInt } from "@/lib/number_formatter"

export default function TgUsdWithdrawPanel() {
  const { actionWithdraw, formState, withdrawWeiValue, setWithdrawWeiValue, maxWithdrawable, setPercentage, percentage } = useTgUsdWithdrawContext()
  const { tgUSDInfo, collateralInfo } = useTgUsdRecordContext()
  const { canInteract } = useWalletConnexionContext()

  const WithdrawAssetDisplay = () => {
    return (
      <PanelRaw className="flex w-48 items-center gap-2 border-white !bg-opacity-0 px-4 py-2 !backdrop-blur-none">
        <TokenImage token={collateralInfo?.logo} size={32} />
        <span className="flex flex-col text-lg leading-3">{collateralInfo.symbol}</span>
      </PanelRaw>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between">
            <span className="text-[20px] font-bold">Withdraw collateral</span>
            <span className="text-xs text-subtitle">
              Max: {formatBigInt(maxWithdrawable, 18, 2)} {collateralInfo?.symbol}
            </span>
          </div>

          <DepositReceiveInput
            displayRecieve={false}
            depositAmount={withdrawWeiValue}
            labelDeposit="You withdraw"
            depositSelect={<WithdrawAssetDisplay />}
            disabled={!canInteract}
            depositAsset={tgUSDInfo}
            balance={maxWithdrawable}
            displaySliderInput={true}
            setMaxBalance={() => {}}
            displayBalance={false}
            onValueChange={(value: bigint | undefined) => {
              setWithdrawWeiValue(value)
            }}
            percentage={percentage}
            setPercentage={setPercentage}
          />
        </div>

        <div>
          <FormButtons actions={{ handleApprove: undefined, handleProcess: actionWithdraw }} formState={formState} labelProcess="Withdraw" />
        </div>
      </div>
    </>
  )
}
