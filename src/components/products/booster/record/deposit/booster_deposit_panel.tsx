"use client"

import { useBoosterRecordContext } from "../booster_record_context"
import InputAssetValue from "@/components/design_system/inputs/input_asset_value"
import { useBoosterDepositContext } from "./booster_deposit_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { Example } from "./test_view"

export default function BoosterDepositPanel() {
  const { assetInfo } = useBoosterRecordContext()
  const { weiValue, setWeiValue, currentAssetInfo, actionApprove, actionDeposit, formState } = useBoosterDepositContext()

  return (
    <>
      <Example />
      {/* <pre>{JSONdebug(onChainData)}</pre>*/}
      {/* <pre>{JSONdebug(currentAssetInfo)}</pre> */}
      <InputAssetValue value={weiValue} asset={assetInfo!} onChange={(value: bigint) => setWeiValue(value)} balance={currentAssetInfo?.balance?.balance} />
      <FormButtons actions={{ handleApprove: actionApprove, handleProcess: actionDeposit }} formState={formState} labelProcess="Deposit & Stake" />
    </>
  )
}
