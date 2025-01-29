"use client"

import React from "react"

import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { DepositRecieveInput } from "@/components/design_system/inputs/deposit_recieve_input"

import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { useTgUsdWithdrawContext } from "./tg_usd_record_withdraw_context"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import TokenImage from "@/components/design_system/structure/token_image"

export default function TgUsdWithdrawPanel() {
  const { actionWithdraw, formState, withdrawWeiValue, setWithdrawWeiValue } = useTgUsdWithdrawContext()
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
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl">Withdraw collateral {collateralInfo.symbol}</span>
          </div>
          <div>
            <DepositRecieveInput
              displayRecieve={false}
              depositAmount={withdrawWeiValue}
              labelDeposit="You withdraw"
              depositSelect={<WithdrawAssetDisplay />}
              disabled={!canInteract}
              depositAsset={tgUSDInfo}
              balance={0n}
              setMaxBalance={() => {}}
              displayBalance={false}
              onValueChange={(value: bigint | undefined) => {
                setWithdrawWeiValue(value)
              }}
            />
          </div>
        </div>

        <div>
          <FormButtons actions={{ handleApprove: undefined, handleProcess: actionWithdraw }} formState={formState} labelProcess="Withdraw" />
        </div>
      </div>
    </>
  )
}
