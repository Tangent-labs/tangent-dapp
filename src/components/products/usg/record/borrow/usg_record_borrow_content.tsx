"use client"

import { formatBigInt } from "@/lib/number_formatter"
import { useUSGRecordContext } from "../usg_record_context"
import { useUSGBorrowContext } from "./usg_record_borrow_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { MaxBorrowCapReached } from "@/components/design_system/notifications/max_borrow_cap_reached"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { MarketTransactionError } from "@/components/design_system/notifications/market_transaction_error"

export default function USGRecordBorrowContent() {
  const { USGInfo, maxBorrowCapReached } = useUSGRecordContext()

  const { actionBorrow, formState, borrowLoading, borrowWeiValue, setBorrowWeiValue, setBorrowPercentage, borrowPercentage, maxBorrowableValue } =
    useUSGBorrowContext()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <span className="text-sm font-semibold md:text-xl">Borrow USG</span>
          <span className="text-xs text-subtitle"> Max: {formatBigInt(maxBorrowableValue, 18, 3)} USG</span>
        </div>

        <GenericInputAssetAmount
          inputWeiValue={borrowWeiValue}
          onValueChange={(value: bigint | undefined) => {
            setBorrowWeiValue(value)
          }}
          disabled={maxBorrowCapReached}
          label="You borrow"
          depositSelect={<StaticCardAssetInput assetName="USG" logoKey="USG" />}
          asset={USGInfo}
          maxAmountParams={{
            maxWeiValue: maxBorrowableValue,
            setMaxAmount: maxBorrowCapReached ? () => {} : () => setBorrowWeiValue(maxBorrowableValue),
          }}
          sliderParams={{
            sliderPercentage: borrowPercentage,
            setSliderPercentage: maxBorrowCapReached ? () => {} : setBorrowPercentage,
          }}
        />
      </div>

      <MarketTransactionError display={!!borrowWeiValue && formState?.cantProcessReasons.length > 0} error={formState?.cantProcessReasons[0]} />

      <MaxBorrowCapReached display={!borrowWeiValue && maxBorrowCapReached} />

      <FormButtons isLoading={borrowLoading} actions={{ handleApprove: undefined, handleProcess: actionBorrow }} formState={formState} labelProcess="Borrow" />
    </div>
  )
}
