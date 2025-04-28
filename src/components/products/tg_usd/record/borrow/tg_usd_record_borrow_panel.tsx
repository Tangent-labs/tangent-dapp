"use client"

import { useTgUsdRecordContext } from "../tg_usd_record_context"
import TokenImage from "@/components/design_system/structure/token_image"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { useTgUsdBorrowContext } from "./tg_usd_record_borrow_context"
import { formatBigInt } from "@/lib/number_formatter"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"

export default function TgUsdBorrowPanel() {
  const { actionBorrow, formState, borrowWeiValue, setBorrowWeiValue, setBorrowPercentage, borrowPercentage, maxBorrowableValue } = useTgUsdBorrowContext()

  const { tgUSDInfo } = useTgUsdRecordContext()

  const { canInteract } = useWalletConnexionContext()

  const BorrowAssetDisplay = () => {
    return (
      <div className="mb-2 mt-auto flex items-center justify-center gap-2 rounded-xl border border-white/30 p-2">
        <TokenImage token={"tgUSD"} size={24} />
        <div className="font-bold">tgUSD</div>
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

        <DepositInput
          displaySliderInput={true}
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
          percentage={borrowPercentage}
          setPercentage={setBorrowPercentage}
        />
      </div>

      <FormButtons actions={{ handleApprove: undefined, handleProcess: actionBorrow }} formState={formState} labelProcess="Borrow" />
    </div>
  )
}
