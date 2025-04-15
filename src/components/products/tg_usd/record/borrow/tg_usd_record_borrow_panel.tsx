"use client"

import React from "react"

import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { DepositReceiveInput } from "@/components/design_system/inputs/deposit_recieve_input"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import TokenImage from "@/components/design_system/structure/token_image"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { useTgUsdBorrowContext } from "./tg_usd_record_borrow_context"
import { formatBigInt } from "@/lib/number_formatter"

export default function TgUsdBorrowPanel() {
  const { actionBorrow, formState, borrowWeiValue, setBorrowWeiValue, setPercentage, percentage, maxBorrowableValue } = useTgUsdBorrowContext()

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
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <span className="text-[20px] font-bold">Borrow tgUSD</span>
          <span className="text-xs text-subtitle"> Max: {formatBigInt(maxBorrowableValue, 18, 2)} tgUSD</span>
        </div>

        <DepositReceiveInput
          displaySliderInput={true}
          displayRecieve={false}
          depositAmount={borrowWeiValue}
          labelDeposit="You borrow"
          depositSelect={<BorrowAssetDisplay />}
          disabled={!canInteract}
          depositAsset={tgUSDInfo}
          setMaxBalance={() => {}}
          balance={maxBorrowableValue}
          displayBalance={false}
          onValueChange={(value: bigint | undefined) => {
            setBorrowWeiValue(value)
          }}
          percentage={percentage}
          setPercentage={setPercentage}
        />
      </div>

      <FormButtons actions={{ handleApprove: undefined, handleProcess: actionBorrow }} formState={formState} labelProcess="Borrow" />
    </div>
  )
}
