"use client"

import { InputSelectLockPosition } from "@/components/design_system/inputs/input_select_lock_position"
import InputSelect from "@/components/design_system/inputs/input_select"
import { useRsTanContext } from "../rstan_layout_context"
import InputToggle from "@/components/design_system/inputs/input_toogle"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import { formatBigInt } from "@/lib/number_formatter"
import FormButtons from "@/components/design_system/form/form_actions"
import { useRsTanLockContext } from "./rstan_lock_context"
import { LockPositionSelectTemplate } from "../../tg_usd/tg_usd_type"
import { formatDate } from "@/lib/other_formatter"
import { InfinityIcon } from "lucide-react"

export default function RsTanLockContent() {
  const { lockData } = useRsTanContext()

  const {
    depositWeiValue,
    depositPositionInfo,
    depositPosition,
    computedNewLockValue,
    computedNewEndLockTime,
    isPermaLock,
    isLoading,
    formState,
    setDepositWeiValue,
    setDepositPosition,
    actionLock,
    actionApprove,
    setIsPermaLock,
  } = useRsTanLockContext()

  const AssetSelectTemplate = (option: LockPositionSelectTemplate) => {
    return (
      <>
        {option && option?.tokenId ? (
          <div className="flex items-center gap-2">
            <span className="text-md font-bold text-white">#{option.tokenId}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-md font-bold text-white">New</span>
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
          label="Select position"
          className="w-full min-w-32"
          template={AssetSelectTemplate}
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
        label="Select position"
        className="w-full min-w-32"
        template={AssetSelectTemplate}
        value={depositPosition || "New"}
        options={[{ value: "New", label: "New" }].concat(selectOptions)}
        onChange={(e) => setDepositPosition(e)}
      />
    )
  }

  return (
    <div className="flex w-full flex-col items-start justify-start">
      <div className="mb-1 text-lg font-bold text-white">Deposit Tan :</div>

      <InputSelectLockPosition
        className="w-full"
        depositAmount={depositWeiValue}
        depositSelect={<PositionSelect />}
        disabled={isLoading}
        isLoading={isLoading}
        balance={lockData?.balance}
        setMaxBalance={() => {}}
        onValueChange={(e) => setDepositWeiValue(e)}
      />

      <div className="mb-1 mt-4 flex w-full items-center justify-between">
        <div className="mb-1 text-lg font-bold text-white">Position recap :</div>

        {depositPosition === "New" && (
          <div className="flex gap-2">
            <div className="mb-1 text-sm text-subtitle">Perma Lock</div>
            <InputToggle onToggle={() => setIsPermaLock(!isPermaLock)} isOn={isPermaLock}></InputToggle>
          </div>
        )}
      </div>

      <div className="flex w-full items-center justify-between gap-4 rounded-[10px] p-3 backdrop-blur-[60px]">
        <EvolutionBox
          className="w-full"
          originalValue={depositPositionInfo ? formatBigInt(depositPositionInfo?.amount, 18, 2) : "0"}
          label="rsTan"
          newValue={computedNewLockValue}
        />
        <EvolutionBox
          className="w-full text-xs"
          originalValue={
            depositPositionInfo?.endLockTime && depositPositionInfo?.endLockTime == "281474976710655" ? (
              <InfinityIcon className="w-5"></InfinityIcon>
            ) : (
              <>
                {" "}
                {depositPositionInfo && depositPositionInfo?.endLockTime !== ""
                  ? formatDate(new Date(Number(depositPositionInfo?.endLockTime) * 1000), "dd/MM/yyyy")
                  : "-"}
              </>
            )
          }
          label="Unlock date"
          newValue={
            depositPositionInfo?.endLockTime && depositPositionInfo?.endLockTime == "281474976710655" ? (
              <InfinityIcon className="w-5"></InfinityIcon>
            ) : (
              <>{isPermaLock ? <InfinityIcon className="w-5"></InfinityIcon> : formatDate(new Date(Number(computedNewEndLockTime) * 1000), "dd/MM/yyyy")}</>
            )
          }
        />
      </div>

      <div className="my-2 flex w-full items-center justify-center gap-4 rounded-[10px] p-3 text-sm text-subtitle backdrop-blur-[60px]">
        Locking more tokens on a existing position will automatically extend the lock duration to its maximum (12weeks).
      </div>

      <div className="flex w-full justify-center">
        <FormButtons
          actions={{
            handleApprove: actionApprove,
            handleProcess: actionLock,
          }}
          formState={formState}
          labelProcess="Lock"
        />
      </div>
    </div>
  )
}
