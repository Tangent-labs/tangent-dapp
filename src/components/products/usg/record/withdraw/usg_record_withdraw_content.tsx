"use client"

import { formatBigInt } from "@/lib/number_formatter"
import { useUSGRecordContext } from "../usg_record_context"
import { useUSGWithdrawContext } from "./usg_record_withdraw_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { AssetSelectionDialog } from "@/components/design_system/inputs/asset-select-dialog"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { AssetInfos, AssetSelectTemplate } from "@/components/design_system/inputs/asset_selector"
import { CollateralInfo } from "@/types"
import { FormAlert } from "@/components/design_system/inputs/form_alert"

interface AssetSelectWithdrawProps {
  collateralInfo: CollateralInfo
  isReceipt: boolean
  selectedAsset: string
  options: AssetInfos[]
  setValue: (v: string) => void
}

export const AssetSelectWithdraw = ({ collateralInfo, isReceipt, selectedAsset, options, setValue }: AssetSelectWithdrawProps) => {
  if (isReceipt) {
    return (
      <AssetSelectionDialog
        className="w-full min-w-24"
        template={AssetSelectTemplate}
        value={selectedAsset || collateralInfo?.name}
        options={options}
        onChange={(v) => setValue(v)}
      />
    )
  } else {
    return <StaticCardAssetInput assetName={collateralInfo.name} logoKey={collateralInfo.logoKey} />
  }
}

export default function USGWithdrawContent() {
  const { connect } = useWalletConnexionContext()

  const { collateralInfo, depositAssetOptions } = useUSGRecordContext()

  const {
    formState,
    withdrawWeiValue,
    maxWithdrawable,
    withdrawPercentage,
    setWithdrawWeiValue,
    actionWithdraw,
    setWithdrawPercentage,
    setSelectedAsset,
    selectedAsset,
    withdrawLoading,
  } = useUSGWithdrawContext()

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between">
            <span className="text-sm font-semibold md:text-xl">Withdraw collateral</span>
            <span className="text-xs text-subtitle">
              Max: {formatBigInt(maxWithdrawable, 18, 3)} {selectedAsset}
            </span>
          </div>

          <GenericInputAssetAmount
            inputWeiValue={withdrawWeiValue}
            onValueChange={setWithdrawWeiValue}
            label="You withdraw"
            disabled={maxWithdrawable === 0n}
            depositSelect={
              <AssetSelectWithdraw
                collateralInfo={collateralInfo!}
                isReceipt={true}
                selectedAsset={selectedAsset!}
                options={depositAssetOptions}
                setValue={setSelectedAsset}
              />
            }
            asset={collateralInfo}
            maxAmountParams={{ maxWeiValue: maxWithdrawable, setMaxAmount: () => setWithdrawWeiValue(maxWithdrawable) }}
            sliderParams={{
              sliderPercentage: withdrawPercentage,
              setSliderPercentage: setWithdrawPercentage,
            }}
          />
        </div>

        {formState.errors
          .filter((e) => e.type === "form-alert")
          .map((error) => (
            <FormAlert key={error.key} error={error} className="my-1" isLoading={withdrawLoading} />
          ))}

        <FormButtons
          isLoading={withdrawLoading}
          connect={connect}
          actions={{ handleApprove: undefined, handleProcess: actionWithdraw }}
          formState={formState}
          labelProcess="Withdraw"
        />
      </div>
    </>
  )
}
