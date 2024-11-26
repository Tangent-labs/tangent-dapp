"use client"

import InputAssetValue from "@/components/design_system/inputs/input_asset_value"
import { useBoosterDepositContext } from "./booster_deposit_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import InputSelect, { InputSelectAmountTemplate } from "@/components/design_system/inputs/input_select"
import { BoosterDepositType } from "../../booster_type"
import { formatBigInt } from "@/lib/number_formatter"

export default function BoosterDepositPanel() {
  const {
    weiValue,
    expected,
    setWeiValue,
    currentAssetInfo,
    setCurrentAsset,
    actionApprove,
    actionDeposit,
    formState,
    positionInfos,
    currentPosition,
    setCurrentPosition,
    depositAssetOptions,
  } = useBoosterDepositContext()
  const { canInteract } = useWalletConnexionContext()

  return (
    <>
      <InputSelect
        value={currentAssetInfo?.current}
        options={depositAssetOptions}
        onChange={(v) => {
          setCurrentAsset(v as BoosterDepositType)
        }}
      />

      <InputSelect
        template={InputSelectAmountTemplate}
        className="min-w-[250px]"
        options={positionInfos}
        label="Position"
        value={currentPosition}
        onChange={(v) => setCurrentPosition(v)}
      />
      {/* <pre>{JSONdebug(currentAssetInfo)}</pre> */}
      <InputAssetValue
        value={weiValue}
        disabled={!canInteract}
        placeholder="Deposit amount"
        asset={currentAssetInfo?.asset}
        onChange={(value: bigint | undefined) => setWeiValue(value)}
        balance={currentAssetInfo?.balance?.balance}
      />
      {currentAssetInfo?.current === "asset" && (
        <span>
          {" "}
          Expected: {formatBigInt(expected, 18, currentAssetInfo?.asset?.displayDecimals || 2)} sd{currentAssetInfo.asset?.symbol}
        </span>
      )}
      <FormButtons actions={{ handleApprove: actionApprove, handleProcess: actionDeposit }} formState={formState} labelProcess="Deposit & Stake" />
    </>
  )
}
