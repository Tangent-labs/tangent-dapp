"use client"

import { zeroAddress } from "viem"
import { CollateralInfo } from "@/types"
import { formatBigInt } from "@/lib/number_formatter"
import { useUSGRecordContext } from "../usg_record_context"
import { useUSGWithdrawContext } from "./usg_record_withdraw_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { FormAlert } from "@/components/design_system/inputs/form_alert"
import { InputSelect } from "@/components/design_system/inputs/input_select"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { AssetSelectionDialog } from "@/components/design_system/inputs/asset-select-dialog"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { AssetInfos, AssetSelectTemplate } from "@/components/design_system/inputs/asset_selector"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"

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

  const { collateralInfo, depositAssetOptions, marketData } = useUSGRecordContext()

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

  const WithdrawAssetSelectTemplate = (option: AssetInfos) => {
    return (
      <div className="flex w-full cursor-pointer items-center gap-2 rounded-[10px] py-1">
        <TokenImage token={option?.logoKey} size={32} />
        <span className="text-sm font-semibold">{option.symbol}</span>
      </div>
    )
  }

  let assetSelectElement = <></>

  if (collateralInfo) {
    assetSelectElement =
      marketData?.constants?.receipt !== zeroAddress ? (
        <InputSelect
          className="w-full"
          template={WithdrawAssetSelectTemplate}
          value={selectedAsset || collateralInfo?.symbol}
          options={depositAssetOptions}
          onChange={(v) => setSelectedAsset(v)}
        />
      ) : (
        <StaticCardAssetInput assetName={collateralInfo.name} logoKey={collateralInfo.logoKey} />
      )
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
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
            depositSelect={assetSelectElement}
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
