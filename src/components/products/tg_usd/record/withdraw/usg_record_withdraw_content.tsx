"use client"

import { formatBigInt } from "@/lib/number_formatter"
import { useUSGRecordContext } from "../tg_usd_record_context"
import { useUSGWithdrawContext } from "./usg_record_withdraw_context"
import FormButtons from "@/components/design_system/form/form_actions"
import InputSelect from "@/components/design_system/inputs/input_select"
import TokenImage from "@/components/design_system/structure/token_image"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { zeroAddress } from "viem"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { ExistingAsset } from "@/types"

export default function USGWithdrawContent() {
  const { connect } = useWalletConnexionContext()

  const { pricedCollateralInfo, collateralInfo, marketData, depositAssetOptions } = useUSGRecordContext()

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
  } = useUSGWithdrawContext()

  const AssetSelectTemplate = (option: { logo?: ExistingAsset; label: string }) => {
    return (
      <div className="flex w-full cursor-pointer items-center gap-2 rounded-[10px] py-1 hover:bg-white/10">
        <TokenImage token={option?.logo} size={24} />
        <span className="text-sm font-semibold">{option.label}</span>
      </div>
    )
  }

  const assetSelectElement =
    marketData?.constants?.receipt !== zeroAddress ? (
      <InputSelect
        className="w-full"
        template={AssetSelectTemplate}
        value={selectedAsset || collateralInfo?.symbol}
        options={depositAssetOptions}
        onChange={(v) => setSelectedAsset(v)}
      />
    ) : (
      <BorderPanel className="flex items-center gap-2 bg-select-input px-2.5 py-2">
        <TokenImage token={collateralInfo?.logo} size={32} />
        <span className="flex flex-col text-sm font-semibold">{collateralInfo?.symbol}</span>
      </BorderPanel>
    )

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

          <DepositInput
            depositAmount={withdrawWeiValue}
            labelDeposit="You withdraw"
            depositSelect={assetSelectElement}
            depositAsset={pricedCollateralInfo}
            balance={maxWithdrawable}
            displaySliderInput={true}
            setMaxBalance={() => setWithdrawWeiValue(maxWithdrawable)}
            onValueChange={setWithdrawWeiValue}
            percentage={withdrawPercentage}
            setPercentage={setWithdrawPercentage}
          />
        </div>

        <>
          {!!withdrawWeiValue && formState.cantProcessReasons.length > 0 && (
            <div className="flex w-full items-center justify-center text-xs text-red-500"> {formState.cantProcessReasons[0]}</div>
          )}
        </>

        <FormButtons connect={connect} actions={{ handleApprove: undefined, handleProcess: actionWithdraw }} formState={formState} labelProcess="Withdraw" />
      </div>
    </>
  )
}
