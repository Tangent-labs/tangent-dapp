"use client"

import { Switch } from "@/components/ui/switch"
import { formatBigInt } from "@/lib/number_formatter"
import { useVsTanContext } from "../rstan_layout_context"
import { useVsTanLockContext } from "./rstan_lock_context"
import { LockPositionSelectTemplate } from "../../usg/usg_type"
import FormButtons from "@/components/design_system/form/form_actions"
import { FormAlert } from "@/components/design_system/inputs/form_alert"
import { InputSelect } from "@/components/design_system/inputs/input_select"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { EvolutionBox } from "@/components/design_system/structure/evolution_box"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { InputSelectLockPosition } from "@/components/design_system/inputs/input_select_lock_position"

// Locking only ever takes TAN, so the asset slot is a static card rather than a selector.
// Mirrors the AssetSelectionDialog trigger, without the chevron and the interactive states.
const TanAssetCard = () => (
  <div className="rounded-[10px] border border-white/10 p-0">
    <div className="flex h-10 w-full items-center justify-center gap-2 rounded-[9px] bg-select-input px-2.5">
      <TokenImage token="TAN" size={20} />
      <span className="text-sm font-semibold">TAN</span>
    </div>
  </div>
)

export default function VsTanLockContent() {
  const { lockData } = useVsTanContext()

  const { connect } = useWalletConnexionContext()

  const {
    depositWeiValue,
    depositPositionInfo,
    depositPosition,
    computedNewLockValue,
    isPermaLock,
    isLoading,
    formState,
    depositAssetInfo,
    maxAmountToDeposit,
    maxDepositWeiValue,
    currentEndLockDate,
    computedNewEndLockDate,
    setDepositPosition,
    actionLock,
    actionApprove,
    setIsPermaLock,
    handleDepositChange,
  } = useVsTanLockContext()

  const PositionSelectTemplate = (option: LockPositionSelectTemplate) => {
    return (
      <>
        {option && option?.tokenId ? (
          <div className="flex items-center gap-2">
            <span className="text-md font-semibold text-white">#{option.tokenId}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-md font-semibold text-white">New</span>
          </div>
        )}
      </>
    )
  }

  const PositionSelect = () => {
    if (!lockData) {
      return (
        <InputSelect
          placeholder="New"
          className="min-w-20"
          template={PositionSelectTemplate}
          value={"New"}
          options={[{ value: "New", label: "New" }]}
          onChange={(e) => setDepositPosition(e)}
        />
      )
    }

    const selectOptions = lockData?.positions?.map((el) => {
      return { ...el, value: el.tokenId.toString(), label: el.tokenId.toString() }
    })

    return (
      <InputSelect
        placeholder="New"
        className="min-w-20"
        template={PositionSelectTemplate}
        value={depositPosition || "New"}
        options={[{ value: "New", label: "New" }].concat(selectOptions)}
        onChange={(e) => setDepositPosition(e)}
      />
    )
  }

  return (
    <div className="flex w-full flex-col justify-start">
      <div className="mb-1 flex w-full items-end justify-between gap-2">
        <span className="text-xl font-semibold text-white">Deposit Tan</span>
        <span className="text-xs text-subtitle">{maxAmountToDeposit}</span>
      </div>

      <InputSelectLockPosition
        depositAmount={depositWeiValue}
        depositSelect={<PositionSelect />}
        assetSelect={<TanAssetCard />}
        depositAsset={depositAssetInfo}
        labelDeposit="You deposit"
        isLoading={isLoading}
        balance={maxDepositWeiValue}
        setMaxBalance={() => {
          handleDepositChange(maxDepositWeiValue)
        }}
        onValueChange={handleDepositChange}
      />

      <div className="mb-1 mt-4 flex w-full items-center justify-between">
        <div className="mb-1 text-xl font-semibold text-white">Position recap :</div>

        {depositPosition === "New" && (
          <div className="flex gap-2">
            <div className="mb-1 text-sm text-subtitle">Perma Lock</div>
            <Switch checked={isPermaLock} onCheckedChange={() => setIsPermaLock(!isPermaLock)} />
          </div>
        )}
      </div>

      <div className="flex w-full items-center justify-between gap-4 rounded-[10px] p-3 backdrop-blur-[60px]">
        <EvolutionBox
          className="w-full"
          originalValue={depositPositionInfo ? formatBigInt(depositPositionInfo?.amount, 18, 2) : "0"}
          label="vsTan"
          newValue={computedNewLockValue}
        />

        <EvolutionBox className="w-full" originalValue={currentEndLockDate} label="Unlock date" newValue={computedNewEndLockDate} />
      </div>

      <div className="mt-2 flex w-full items-center justify-center gap-4 rounded-[10px] p-3 text-sm text-subtitle backdrop-blur-[60px]">
        Locking more tokens on an existing position will automatically extend the lock duration to its maximum (13 weeks).
      </div>

      {formState.errors
        .filter((e) => e.type === "form-alert")
        .map((error) => (
          <FormAlert key={error.key} error={error} className="my-1" isLoading={isLoading} />
        ))}

      <div className="mt-2 flex w-full justify-center">
        <FormButtons
          actions={{ handleApprove: actionApprove, handleProcess: actionLock }}
          connect={connect}
          formState={formState}
          isLoading={isLoading}
          labelProcess="Lock"
        />
      </div>
    </div>
  )
}
