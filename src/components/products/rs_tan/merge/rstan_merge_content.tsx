"use client"

import InputSelect from "@/components/design_system/inputs/input_select"
import { useRsTanContext } from "../rstan_layout_context"
import { LockPositionSelectTemplate } from "../../tg_usd/tg_usd_type"
import { IconRsTan } from "@/components/icons/icon_rstan"
import { formatBigInt } from "@/lib/number_formatter"
import { useRsTanMergeContext } from "./rstan_merge_context"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import { Button } from "@/components/design_system/inputs/button"
import { formatDate } from "@/lib/other_formatter"

export const RsTanMergeContent = () => {
  const { lockData } = useRsTanContext()

  const {
    actionMerge,
    setSecondPositionToMerge,
    setFirstPositionToMerge,
    firstPositionToMerge,
    computedNewPositionId,
    secondPositionToMerge,
    firstPositionToMergeInfo,
    secondPositionToMergeInfo,
    computedNewUnlockDate,
  } = useRsTanMergeContext()

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
          disabled={true}
          className="w-full min-w-32"
          template={AssetSelectTemplate}
          value={""}
          options={[]}
          onChange={(e) => setFirstPositionToMerge(e)}
        />
      )
    }

    const selectOptions = lockData?.positions?.map((el) => {
      return { ...el, value: el.tokenId.toString(), label: el.tokenId.toString() }
    })

    return (
      <InputSelect
        className="w-full min-w-32"
        template={AssetSelectTemplate}
        value={firstPositionToMerge || ""}
        options={selectOptions}
        onChange={(e) => setFirstPositionToMerge(e)}
      />
    )
  }

  const SecondPositionSelect = () => {
    if (!lockData || (!!lockData && lockData?.positions.length === 0)) {
      return (
        <InputSelect
          disabled={true}
          className="w-full min-w-32"
          template={AssetSelectTemplate}
          value={""}
          options={[]}
          onChange={(e) => setSecondPositionToMerge(e)}
        />
      )
    }

    const selectOptions = lockData?.positions?.map((el) => {
      return { ...el, value: el.tokenId.toString(), label: el.tokenId.toString() }
    })

    return (
      <InputSelect
        className="w-full min-w-32"
        template={AssetSelectTemplate}
        value={secondPositionToMerge || ""}
        options={selectOptions}
        onChange={(e) => setSecondPositionToMerge(e)}
      />
    )
  }

  return (
    <div className="flex w-full flex-col items-start justify-start">
      <div className="mb-3 text-lg font-bold text-white">Select position to split:</div>

      <div className="mt-2 flex h-10 w-full items-start justify-between gap-2">
        <PositionSelect />
        <div className="mt-1 flex h-full w-full items-center justify-between gap-4 rounded-[10px] bg-overlay-panel p-3 text-sm text-subtitle">
          Balance:
          {firstPositionToMerge && firstPositionToMergeInfo?.amount && (
            <span className="flex items-center justify-end text-lg font-bold text-white">
              {formatBigInt(firstPositionToMergeInfo?.amount, 18, 2)} <IconRsTan className="ml-2 h-5 w-5"></IconRsTan>
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 flex h-10 w-full items-start justify-between gap-2">
        <SecondPositionSelect />
        <div className="mt-1 flex h-full w-full items-center justify-between gap-4 rounded-[10px] bg-overlay-panel p-3 text-sm text-subtitle">
          Balance:
          {secondPositionToMerge && secondPositionToMergeInfo?.amount && (
            <span className="flex items-center justify-end text-lg font-bold text-white">
              {formatBigInt(secondPositionToMergeInfo?.amount, 18, 2)} <IconRsTan className="ml-2 h-5 w-5"></IconRsTan>
            </span>
          )}
        </div>
      </div>

      {secondPositionToMergeInfo && firstPositionToMergeInfo && (
        <>
          <div className="my-3 text-lg font-bold text-white">Merge recap:</div>

          <div className="flex w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel px-2 py-3 backdrop-blur-[60px]">
            <div className="flex w-full items-start justify-start gap-2">
              <div className="w-3/12">Pos. ID</div>
              <div className="w-6/12">rsTan</div>
              <div className="w-3/12">Unlock date</div>
            </div>

            <div className="my-1 flex w-full items-center justify-center gap-2">
              <div className="relative flex h-10 w-3/12 items-center justify-start rounded-[10px] bg-overlay-panel px-4 font-bold backdrop-blur-[60px]">
                #{firstPositionToMergeInfo?.tokenId}
                <div className="absolute right-0 top-0 flex w-[60px] justify-center rounded-[10px] bg-danger py-0.5 text-xs text-black">Deleted</div>
              </div>
              <EvolutionBox
                className="w-6/12"
                originalValue={
                  <div className="flex items-center justify-center text-lg font-bold">
                    {formatBigInt(firstPositionToMergeInfo?.amount, 18, 2)} <IconRsTan className="ml-2 h-5 w-5"></IconRsTan>
                  </div>
                }
                newValue={
                  <div className="flex items-center justify-center text-lg font-bold">
                    - <IconRsTan className="ml-4 h-5 w-5"></IconRsTan>
                  </div>
                }
              />
              <div className="flex h-10 w-3/12 items-center justify-center rounded-[10px] bg-overlay-panel px-4 backdrop-blur-[60px]">-</div>{" "}
            </div>

            <div className="my-1 flex w-full items-center justify-center gap-2">
              <div className="relative flex h-10 w-3/12 items-center justify-start rounded-[10px] bg-overlay-panel px-4 font-bold backdrop-blur-[60px]">
                #{secondPositionToMergeInfo?.tokenId}
                <div className="absolute right-0 top-0 flex w-[60px] justify-center rounded-[10px] bg-danger py-0.5 text-xs text-black">Deleted</div>
              </div>
              <EvolutionBox
                className="w-6/12"
                originalValue={
                  <div className="flex items-center justify-center text-lg font-bold">
                    {formatBigInt(secondPositionToMergeInfo?.amount, 18, 2)} <IconRsTan className="ml-2 h-5 w-5"></IconRsTan>
                  </div>
                }
                newValue={
                  <div className="flex h-full items-center justify-center text-lg font-bold">
                    - <IconRsTan className="ml-4 h-5 w-5"></IconRsTan>
                  </div>
                }
              />
              <div className="flex h-10 w-3/12 items-center justify-center rounded-[10px] bg-overlay-panel px-4 backdrop-blur-[60px]">-</div>
            </div>

            <div className="my-1 flex w-full items-center justify-center gap-2">
              <div className="relative flex h-10 w-3/12 items-center justify-start rounded-[10px] bg-overlay-panel px-4 font-bold backdrop-blur-[60px]">
                #{computedNewPositionId}
                <div className="absolute right-0 top-0 flex w-[60px] justify-center rounded-[10px] bg-tonic py-0.5 text-xs text-black">New</div>
              </div>
              <EvolutionBox
                className="w-6/12"
                originalValue={
                  <div className="flex h-full items-center justify-center pl-4 text-lg font-bold">
                    - <IconRsTan className="ml-4 h-5 w-5"></IconRsTan>
                  </div>
                }
                newValue={
                  <div className="flex h-full items-center justify-center pl-4 text-lg font-bold">
                    {formatBigInt(secondPositionToMergeInfo?.amount + firstPositionToMergeInfo?.amount, 18, 2)}
                    <IconRsTan className="ml-2 h-5 w-5"></IconRsTan>
                  </div>
                }
              />
              <div className="flex h-10 w-3/12 items-center justify-center rounded-[10px] bg-overlay-panel px-4 backdrop-blur-[60px]">
                {formatDate(new Date(Number(computedNewUnlockDate) * 1000), "dd/MM/yyyy")}
              </div>
            </div>
          </div>

          <Button className="flex w-full justify-center" onClick={actionMerge}>
            Merge
          </Button>
        </>
      )}
    </div>
  )
}
