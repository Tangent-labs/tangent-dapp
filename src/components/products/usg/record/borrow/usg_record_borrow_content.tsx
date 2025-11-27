"use client"

import { formatBigInt } from "@/lib/number_formatter"
import { useUSGRecordContext } from "../usg_record_context"
import { useUSGBorrowContext } from "./usg_record_borrow_context"
import FormButtons from "@/components/design_system/form/form_actions"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { BorrowInput } from "@/components/design_system/inputs/borrow_input"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { MaxBorrowCapReached } from "@/components/design_system/notifications/max_borrow_cap_reached"
import { MarketTransactionError } from "@/components/design_system/notifications/market_transaction_error"

export default function USGRecordBorrowContent() {
  const { connect } = useWalletConnexionContext()

  const { USGInfo, maxBorrowCapReached } = useUSGRecordContext()

  const { actionBorrow, formState, borrowWeiValue, setBorrowWeiValue, setBorrowPercentage, borrowPercentage, maxBorrowableValue } = useUSGBorrowContext()

  const BorrowAssetDisplay = () => {
    return (
      <BorderPanel className="flex items-center gap-2 bg-select-input px-2.5 py-2">
        <TokenImage token="USG" size={20} />
        <span className="flex flex-col text-[15px] font-semibold">USG</span>
      </BorderPanel>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <span className="text-sm font-semibold md:text-xl">Borrow USG</span>
          <span className="text-xs text-subtitle"> Max: {formatBigInt(maxBorrowableValue, 18, 3)} USG</span>
        </div>

        <BorrowInput
          displaySliderInput={true}
          borrowAmount={borrowWeiValue}
          disabled={maxBorrowCapReached}
          labelDeposit="You borrow"
          depositSelect={<BorrowAssetDisplay />}
          borrowAsset={USGInfo}
          setMaxBalance={maxBorrowCapReached ? () => {} : () => setBorrowWeiValue(maxBorrowableValue)}
          balance={maxBorrowableValue}
          onValueChange={(value: bigint | undefined) => {
            setBorrowWeiValue(value)
          }}
          percentage={borrowPercentage}
          setPercentage={maxBorrowCapReached ? () => {} : setBorrowPercentage}
        />
      </div>

      <MarketTransactionError display={!!borrowWeiValue && formState?.cantProcessReasons.length > 0} error={formState?.cantProcessReasons[0]} />

      <MaxBorrowCapReached display={!borrowWeiValue && maxBorrowCapReached} />

      <FormButtons connect={connect} actions={{ handleApprove: undefined, handleProcess: actionBorrow }} formState={formState} labelProcess="Borrow" />
    </div>
  )
}
