"use client"

import { Switch } from "@/components/ui/switch"
import { formatBigInt } from "@/lib/number_formatter"
import { useVsTanContext } from "../rstan_layout_context"
import { useVsTanLockContext } from "./rstan_lock_context"
import { LockPositionSelectTemplate } from "../../usg/usg_type"
import { IconCircleHelp, IconThunder } from "@/components/icons"
import FormButtons from "@/components/design_system/form/form_actions"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import { PanelRaw } from "@/components/design_system/structure/panel_raw"
import { InputSelect } from "@/components/design_system/inputs/input_select"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { EvolutionBox } from "@/components/design_system/structure/evolution_box"
import { ZapAssetSelector } from "@/components/design_system/inputs/asset_selector"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { InputSelectLockPosition } from "@/components/design_system/inputs/input_select_lock_position"

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
    depositAsset,
    zapValue,
    zapInnerValue,
    estimatedZapDollarValue,
    isZapLoading,
    depositAssetInfo,
    maxAmountToDeposit,
    maxDepositWeiValue,
    slippage,
    setSlippage,
    setDepositAsset,
    setDepositPosition,
    actionLock,
    actionZapAndLock,
    actionApprove,
    actionApproveZap,
    setIsPermaLock,
    handleZapInputChange,
    handleDepositChange,
  } = useVsTanLockContext()

  const isZapping = !!depositAsset && depositAsset !== "TAN"

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
    <div className="flex w-full flex-col items-start justify-start">
      <div className="mb-1 flex w-full items-end justify-between gap-2">
        <span className="text-lg font-semibold text-white">Deposit Tan</span>
        <span className="text-xs text-subtitle">{maxAmountToDeposit}</span>
      </div>

      <InputSelectLockPosition
        depositAmount={depositWeiValue}
        depositSelect={<PositionSelect />}
        assetSelect={<ZapAssetSelector caseType="lock" depositAsset={depositAsset} setDepositAsset={setDepositAsset} disabled={isLoading} />}
        depositAsset={depositAssetInfo}
        labelDeposit={isZapping ? "You sell" : "You deposit"}
        isZapping={isZapping}
        isLoading={isLoading}
        slippageInput={isZapping ? <SlippageInput slippage={slippage} setSlippage={setSlippage} /> : undefined}
        balance={maxDepositWeiValue}
        setMaxBalance={() => {
          handleDepositChange(maxDepositWeiValue)
        }}
        onValueChange={handleDepositChange}
      />

      {isZapping && (
        <PanelRaw className={`${isZapLoading ? "shimmer" : ""} mt-1.5 flex w-full flex-col gap-1 p-2.5`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start justify-start">
              <div className="flex items-center justify-center gap-1">
                <div className="text-sm text-subtitle">Zap</div>
                <IconThunder className="h-auto w-[8px] text-row-tonic" />
                <IconCircleHelp className="h-auto w-[12px] text-row-tonic" />
              </div>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  disabled={isZapLoading}
                  className="flex w-fit max-w-[140px] justify-start bg-transparent text-[24px] font-semibold focus:outline-none"
                  value={zapInnerValue ?? ""}
                  onChange={handleZapInputChange}
                />
              </div>
              <div className="flex items-center justify-start gap-2 text-xs text-subtitle">
                <div className="hidden md:flex">Minimum received </div>
                <div> {!!zapValue ? estimatedZapDollarValue : ""}</div>
              </div>
            </div>
            <ReliefCard className="flex items-center justify-center gap-2 px-2.5 py-2">
              <TokenImage token="TAN" size={24} />
              <div className="font-semibold">TAN</div>
            </ReliefCard>
          </div>
        </PanelRaw>
      )}

      <div className="mb-1 mt-4 flex w-full items-center justify-between">
        <div className="mb-1 text-lg font-semibold text-white">Position recap :</div>

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
      </div>

      <div className="mt-2 flex w-full items-center justify-center gap-4 rounded-[10px] p-3 text-sm text-subtitle backdrop-blur-[60px]">
        Locking more tokens on a existing position will automatically extend the lock duration to its maximum (12weeks).
      </div>

      <div className="mt-2 flex w-full justify-center">
        <FormButtons
          actions={{
            handleApprove: depositAsset === "TAN" ? actionApprove : actionApproveZap,
            handleProcess: depositAsset === "TAN" ? actionLock : actionZapAndLock,
          }}
          connect={connect}
          formState={formState}
          labelProcess="Lock"
        />
      </div>
    </div>
  )
}
