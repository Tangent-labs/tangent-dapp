"use client"

import { formatBigInt } from "@/lib/number_formatter"
import { useUSGRecordContext } from "../usg_record_context"
import { useUSGBorrowContext } from "./usg_record_borrow_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { FormAlert } from "@/components/design_system/inputs/form_alert"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { MaxBorrowCapReached } from "@/components/design_system/notifications/max_borrow_cap_reached"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"

export default function USGRecordBorrowContent() {
  const { connect } = useWalletConnexionContext()

  const { USGInfo, maxBorrowCapReached } = useUSGRecordContext()

  const { actionBorrow, formState, borrowLoading, borrowWeiValue, setBorrowWeiValue, setBorrowPercentage, borrowPercentage, maxBorrowableValue } =
    useUSGBorrowContext()

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold md:text-xl">Borrow USG</span>
        <span className="text-xs text-subtitle"> Max: {formatBigInt(maxBorrowableValue, 18, 3)} USG</span>
      </div>

      <GenericInputAssetAmount
        inputWeiValue={borrowWeiValue}
        onValueChange={(value: bigint | undefined) => {
          setBorrowWeiValue(value)
        }}
        // disabled={maxBorrowCapReached || maxBorrowableValue === 0n}
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

      <MaxBorrowCapReached display={!borrowWeiValue && maxBorrowCapReached} />

      {formState.errors
        .filter((e) => e.type === "form-alert")
        .map((error) => (
          <FormAlert key={error.key} error={error} className="my-1" isLoading={borrowLoading} />
        ))}

      <FormButtons
        isLoading={borrowLoading}
        connect={connect}
        actions={{ handleApprove: undefined, handleProcess: actionBorrow }}
        formState={formState}
        labelProcess="Borrow"
      />
    </div>
  )
}
