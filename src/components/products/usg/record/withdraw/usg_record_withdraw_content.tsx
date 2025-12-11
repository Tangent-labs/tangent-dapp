"use client"

import Image from "next/image"
import { ExistingAsset } from "@/types"
import { Address, zeroAddress } from "viem"
import { formatAddress } from "@/lib/other_formatter"
import { formatBigInt } from "@/lib/number_formatter"
import { useUSGRecordContext } from "../usg_record_context"
import { useUSGWithdrawContext } from "./usg_record_withdraw_context"
import FormButtons from "@/components/design_system/form/form_actions"
import TokenImage from "@/components/design_system/structure/token_image"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import AssetSelectionDialog from "@/components/design_system/inputs/asset-select-dialog"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

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

  const AssetSelectTemplate = (option: {
    logoURI?: string
    logo?: ExistingAsset
    value: string
    name?: string
    symbol: string
    balance?: bigint
    decimals?: number
    address?: Address
  }) => {
    return (
      <div className="flex w-full min-w-48 cursor-pointer items-center justify-between px-2 py-1 hover:rounded-full hover:bg-white/30">
        <div className="flex w-full items-center gap-2">
          <>{option.logoURI ? <Image src={option.logoURI} alt={option.logoURI} height={32} width={32} /> : <TokenImage token={option.logo} size={32} />}</>

          <div className="flex flex-col items-start justify-start">
            <span className="text-sm font-semibold">{option.symbol}</span>
            <span className="text-xs text-subtitle">{formatAddress(option?.address, 4)}</span>
          </div>
        </div>
        <span className="ml-auto text-xs text-subtitle">{formatBigInt(option.balance!, option.decimals!, 2)}</span>
      </div>
    )
  }

  const AssetSelect = () => {
    const disabled = marketData?.constants?.receipt === zeroAddress

    return (
      <AssetSelectionDialog
        disabled={disabled}
        className="w-full min-w-24"
        template={AssetSelectTemplate}
        value={selectedAsset || collateralInfo?.symbol}
        options={depositAssetOptions}
        onChange={(v) => setSelectedAsset(v)}
      />
    )
  }

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
            depositSelect={<AssetSelect />}
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
