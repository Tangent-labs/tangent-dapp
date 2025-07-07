"use client"

import { useTgUsdRecordContext } from "../tg_usd_record_context"
import TokenImage from "@/components/design_system/structure/token_image"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { useTgUsdBorrowContext } from "./tg_usd_record_borrow_context"
import { formatBigInt } from "@/lib/number_formatter"
import { BorrowInput } from "@/components/design_system/inputs/borrow_input"
import BorderPanel from "@/components/design_system/structure/border_panel"

export default function TgUsdBorrowPanel() {
  const { actionBorrow, formState, borrowWeiValue, setBorrowWeiValue, setBorrowPercentage, borrowPercentage, maxBorrowableValue } = useTgUsdBorrowContext()

  const { tgUSDInfo } = useTgUsdRecordContext()

  const { canInteract } = useWalletConnexionContext()

  const BorrowAssetDisplay = () => {
    return (
      <BorderPanel className="flex items-center gap-2 bg-select-input px-2.5 py-2.5">
        <TokenImage token="USG" size={20} />
        <span className="flex flex-col text-[15px] font-semibold">USG</span>
      </BorderPanel>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <span className="text-[20px] font-semibold">Borrow USG</span>
          <span className="text-xs text-subtitle"> Max: {formatBigInt(maxBorrowableValue, 18, 3)} USG</span>
        </div>

        <BorrowInput
          displaySliderInput={true}
          borrowAmount={borrowWeiValue}
          labelDeposit="You borrow"
          depositSelect={<BorrowAssetDisplay />}
          disabled={!canInteract}
          borrowAsset={tgUSDInfo}
          setMaxBalance={() => setBorrowWeiValue(maxBorrowableValue)}
          balance={maxBorrowableValue}
          onValueChange={(value: bigint | undefined) => {
            setBorrowWeiValue(value)
          }}
          percentage={borrowPercentage}
          setPercentage={setBorrowPercentage}
        />
      </div>

      <>
        {!!borrowWeiValue && formState?.cantProcessReasons.length > 0 && (
          <div className="flex w-full items-center justify-center text-xs text-red-500">{formState?.cantProcessReasons[0]}</div>
        )}
      </>

      <FormButtons actions={{ handleApprove: undefined, handleProcess: actionBorrow }} formState={formState} labelProcess="Borrow" />
    </div>
  )
}
