"use client"

import { useBoosterDepositContext } from "./booster_deposit_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import InputSelect, { InputSelectAmountTemplate } from "@/components/design_system/inputs/input_select"
import { BoosterDepositType } from "../../booster_type"
import { formatBigInt } from "@/lib/number_formatter"
import { DepositRecieveInput } from "@/components/design_system/inputs/deposit_recieve_input"
import TokenImage from "@/components/design_system/structure/token_image"
import { useBoosterRecordContext } from "../booster_record_context"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import SkeletonList from "@/components/design_system/structure/skeletons/skeleton_list"
import { ExistingAsset, SelectOption } from "@/types"
import { formatUnits } from "viem"

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
  const { assetInfo, sdAssetInfo, isProMode } = useBoosterRecordContext()

  const { canInteract } = useWalletConnexionContext()

  const RecieveAssetDisplay = () => {
    if (!sdAssetInfo) return <></>

    return (
      <PanelRaw className="flex w-48 items-center gap-2 border-white !bg-opacity-0 px-4 py-2 !backdrop-blur-none">
        <div className="">
          <TokenImage token={sdAssetInfo.logo} size={32} />
        </div>
        <span className="flex flex-col text-lg leading-3">
          <span>{sdAssetInfo.symbol}</span>
          <span className="text-xs text-gray-400">gauge</span>
        </span>
      </PanelRaw>
    )
  }

  const AssetSelectTemplate = (option: SelectOption) => {
    const { assetInfo, sdAssetInfo } = useBoosterRecordContext()
    if (!sdAssetInfo || !assetInfo) return <></>

    const isGauge = option.label.endsWith("-gauge")

    let logo: ExistingAsset | undefined = assetInfo?.logo
    if (["sdAsset", "gaugeAsset"].includes(option.value)) {
      logo = sdAssetInfo.logo
    }
    return (
      <div className="flex items-center gap-1">
        <div>
          <TokenImage token={logo} size={32} />
        </div>
        {isGauge ? (
          <span className="flex flex-col items-start text-lg leading-3">
            <span>{sdAssetInfo.symbol}</span>
            <span className="text-xs text-gray-400">gauge</span>
          </span>
        ) : (
          <span className="text-sm">{option.label}</span>
        )}
      </div>
    )
  }

  const AssetSelect = () => {
    return (
      <div className="min-w-48">
        <InputSelect
          className="w-full"
          template={AssetSelectTemplate}
          value={currentAssetInfo?.current}
          options={depositAssetOptions}
          onChange={(v) => {
            setCurrentAsset(v as BoosterDepositType)
          }}
        />
      </div>
    )
  }

  if (!assetInfo) {
    return <SkeletonList />
  }

  return (
    <div className="flex flex-col gap-2">
      <DepositRecieveInput
        depositAmount={weiValue}
        depositSelect={<AssetSelect />}
        disabled={!canInteract}
        recieveAssetDisplay={<RecieveAssetDisplay />}
        depositAsset={currentAssetInfo?.asset}
        recieveDollarValue={(Number(formatUnits(expected || 0n, sdAssetInfo?.decimals || 18)) * (sdAssetInfo?.price || 0))?.toFixed(2)}
        balance={currentAssetInfo?.balance?.balance}
        recieveAmount={formatBigInt(expected, 18, currentAssetInfo?.asset?.displayDecimals || 2)}
        setMaxBalance={() => {
          setWeiValue(currentAssetInfo?.balance?.balance || 0n)
        }}
        onValueChange={(value: bigint | undefined) => setWeiValue(value)}
      />

      {isProMode && (
        <InputSelect
          template={InputSelectAmountTemplate}
          className="min-w-[250px]"
          options={positionInfos}
          label="Position"
          value={currentPosition}
          onChange={(v) => setCurrentPosition(v)}
        />
      )}
      <FormButtons actions={{ handleApprove: actionApprove, handleProcess: actionDeposit }} formState={formState} labelProcess="Deposit & Stake" />
    </div>
  )
}
