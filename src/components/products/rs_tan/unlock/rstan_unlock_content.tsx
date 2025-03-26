"use client"

import InputSelect from "@/components/design_system/inputs/input_select"
import { useRsTanContext } from "../rstan_layout_context"
import { useRsTanUnlockContext } from "./rstan_unlock_context"
import { LockPositionSelectTemplate } from "../../tg_usd/tg_usd_type"
import { IconRsTan } from "@/components/icons/icon_rstan"
import { Button } from "@/components/design_system/inputs/button"
import { formatBigInt } from "@/lib/number_formatter"

export const RsTanUnlockContent = () => {
  const { lockData } = useRsTanContext()

  const { depositPosition, tanReceived, depositPositionInfo, setDepositPosition, actionUnlock, actionRageQuit } = useRsTanUnlockContext()

  const AssetSelectTemplate = (option: LockPositionSelectTemplate) => {
    return (
      <>
        {option && option?.tokenId ? (
          <div className="flex items-center gap-2">
            <span className="text-md font-bold text-white">#{option.tokenId}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-md font-bold text-white"></span>
          </div>
        )}
      </>
    )
  }

  const PositionSelect = () => {
    if (!lockData || (!!lockData && lockData?.positions.length === 0)) {
      return (
        <InputSelect
          placeholder=""
          label=""
          disabled={true}
          className="w-full min-w-32"
          template={AssetSelectTemplate}
          value={""}
          options={[]}
          onChange={(e) => setDepositPosition(e)}
        />
      )
    }

    const selectOptions = lockData?.positions?.map((el) => {
      return { ...el, value: el.tokenId.toString(), label: el.tokenId.toString() }
    })

    return (
      <InputSelect
        placeholder=""
        label="Select position"
        className="w-full min-w-32"
        template={AssetSelectTemplate}
        value={depositPosition || ""}
        options={selectOptions}
        onChange={(e) => setDepositPosition(e)}
      />
    )
  }

  return (
    <div className="flex w-full flex-col items-start justify-start">
      <div className="mb-1 text-lg font-bold text-white">Select position :</div>

      <PositionSelect />

      <div className="mt-3 text-lg font-bold text-white">Unlock recap :</div>

      <div className="flex w-full items-center justify-around gap-2 rounded-[10px] border border-white/10 bg-white bg-opacity-[1%] p-3 backdrop-blur-[30px]">
        <div className="flex w-full flex-col items-start justify-start">
          <div>TAN received</div>

          {depositPositionInfo && depositPositionInfo?.amount ? (
            <div className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-white/10 bg-white/10 bg-opacity-[1%] text-tonic backdrop-blur-[30px]">
              {formatBigInt(tanReceived, 18, 2)} <IconRsTan className="w-5"></IconRsTan>
            </div>
          ) : (
            <div className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-white/10 bg-white/10 bg-opacity-[1%] backdrop-blur-[30px]">
              0 <IconRsTan className="w-5"></IconRsTan>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col items-start justify-start">
          <div>TAN forfeited</div>

          {depositPositionInfo && depositPositionInfo?.amount ? (
            <div className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-white/10 bg-white/10 bg-opacity-[1%] backdrop-blur-[30px]">
              {formatBigInt(depositPositionInfo?.amount - (tanReceived || 0n), 18, 2)} <IconRsTan className="w-5"></IconRsTan>
            </div>
          ) : (
            <div className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-white/10 bg-white/10 bg-opacity-[1%] backdrop-blur-[30px]">
              0 <IconRsTan className="w-5"></IconRsTan>
            </div>
          )}
        </div>
      </div>

      {depositPositionInfo?.amount === tanReceived ? (
        <Button className="mt-3 flex w-full justify-center" onClick={actionUnlock}>
          Unlock
        </Button>
      ) : (
        <Button className="mt-3 flex w-full justify-center" onClick={actionRageQuit}>
          Rage quit
        </Button>
      )}
    </div>
  )
}
