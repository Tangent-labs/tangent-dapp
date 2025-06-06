"use client"

import { useTgUsdRecordContext } from "../tg_usd_record_context"
import TokenImage from "@/components/design_system/structure/token_image"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { useTgUsdBorrowContext } from "./tg_usd_record_borrow_context"
import { formatBigInt } from "@/lib/number_formatter"
import { BorrowInput } from "@/components/design_system/inputs/borrow_input"

export default function TgUsdBorrowPanel() {
  const { actionBorrow, formState, borrowWeiValue, setBorrowWeiValue, setBorrowPercentage, borrowPercentage, maxBorrowableValue } = useTgUsdBorrowContext()

  const { tgUSDInfo } = useTgUsdRecordContext()

  const { canInteract } = useWalletConnexionContext()

  const BorrowAssetDisplay = () => {
    return (
      <div className="flex items-center gap-2 rounded-[10px] border border-white border-opacity-20 bg-select-input px-3 py-2">
        <TokenImage token="tgUSD" size={20} />
        <span className="flex flex-col text-[15px] font-bold">tgUSD</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <span className="text-[20px] font-bold">Borrow tgUSD</span>
          <span className="text-xs text-subtitle"> Max: {formatBigInt(maxBorrowableValue, 18, 2)} tgUSD</span>
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

      <FormButtons actions={{ handleApprove: undefined, handleProcess: actionBorrow }} formState={formState} labelProcess="Borrow" />
    </div>
  )
}
