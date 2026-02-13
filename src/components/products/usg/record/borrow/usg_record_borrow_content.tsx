"use client"

import { formatBigInt } from "@/lib/number_formatter"
import { useUSGRecordContext } from "../usg_record_context"
import { useUSGBorrowContext } from "./usg_record_borrow_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { MaxBorrowCapReached } from "@/components/design_system/notifications/max_borrow_cap_reached"
import { MarketTransactionError } from "@/components/design_system/notifications/market_transaction_error"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { PERCENTAGE_INPUT_AMOUNT } from "@/lib/utils"

export default function USGRecordBorrowContent() {
  const { connect } = useWalletConnexionContext()

  const { USGInfo, maxBorrowCapReached } = useUSGRecordContext()

  const { actionBorrow, formState, borrowWeiValue, setBorrowWeiValue, setBorrowPercentage, borrowPercentage, maxBorrowableValue } = useUSGBorrowContext()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <span className="text-sm font-semibold md:text-xl">Borrow USG</span>
          <span className="text-xs text-subtitle"> Max: {formatBigInt(maxBorrowableValue, 18, 3)} USG</span>
        </div>

        <GenericInputAssetAmount
          displaySliderInput={true}
          inputWeiValue={borrowWeiValue}
          disabled={maxBorrowCapReached}
          label="You borrow"
          depositSelect={<StaticCardAssetInput asset="USG" />}
          asset={USGInfo}
          setMaxAmount={maxBorrowCapReached ? () => {} : () => setBorrowWeiValue(maxBorrowableValue)}
          balance={maxBorrowableValue}
          onValueChange={(value: bigint | undefined) => {
            setBorrowWeiValue(value)
          }}
          sliderPercentage={borrowPercentage}
          setSliderPercentage={maxBorrowCapReached ? () => {} : setBorrowPercentage}
          sliderLegendValues={PERCENTAGE_INPUT_AMOUNT}
        />
      </div>

      <MarketTransactionError display={!!borrowWeiValue && formState?.cantProcessReasons.length > 0} error={formState?.cantProcessReasons[0]} />

      <MaxBorrowCapReached display={!borrowWeiValue && maxBorrowCapReached} />

      <FormButtons connect={connect} actions={{ handleApprove: undefined, handleProcess: actionBorrow }} formState={formState} labelProcess="Borrow" />
    </div>
  )
}
