"use client"

import React from "react"

import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { DepositRecieveInput } from "@/components/design_system/inputs/deposit_recieve_input"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import TokenImage from "@/components/design_system/structure/token_image"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { useTgUsdRepayContext } from "./tg_usd_record_repay_context"

export default function TgUsdRepayPanel() {
  const { actionRepay, formState, repayWeiValue, setRepayWeiValue } = useTgUsdRepayContext()
  const { tgUSDInfo } = useTgUsdRecordContext()
  const { canInteract } = useWalletConnexionContext()

  const BorrowAssetDisplay = () => {
    return (
      <PanelRaw className="flex w-48 items-center gap-2 border-white !bg-opacity-0 px-4 py-2 !backdrop-blur-none">
        <div className="">
          <TokenImage token={"tgUSD"} size={32} />
        </div>
        <span className="flex flex-col text-lg leading-3">
          <span>tgUSD</span>
        </span>
      </PanelRaw>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl">Repay tgUSD</span>
          </div>

          <div>
            <DepositRecieveInput
              displayRecieve={false}
              depositAmount={repayWeiValue}
              labelDeposit="You repay"
              depositSelect={<BorrowAssetDisplay />}
              disabled={!canInteract}
              depositAsset={tgUSDInfo}
              balance={0n}
              setMaxBalance={() => {}}
              displayBalance={false}
              onValueChange={(value: bigint | undefined) => {
                setRepayWeiValue(value)
              }}
            />
          </div>
        </div>

        <div>
          <FormButtons actions={{ handleApprove: undefined, handleProcess: actionRepay }} formState={formState} labelProcess="Repay" />
        </div>
      </div>
    </>
  )
}
