"use client"

import InputSelect from "@/components/design_system/inputs/input_select"
import { useRsTanContext } from "../rstan_layout_context"
import { LockPositionSelectTemplate } from "../../tg_usd/tg_usd_type"
import { IconVsTan } from "@/components/icons/icon_vstan"
import { formatBigInt } from "@/lib/number_formatter"
import { useRsTanSplitContext } from "./rstan_split_context"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import { formatDate } from "@/lib/other_formatter"
import { InfinityIcon } from "lucide-react"
import FormButtons from "@/components/design_system/form/form_actions"

export const RsTanSplitContent = () => {
  const { lockData } = useRsTanContext()

  const {
    splitPosition,
    splitPositionInfo,
    splitPercentage,
    computedNewPositionIds,
    computedSplitAmounts,
    visualPercentage,
    formState,
    setSplitPosition,
    actionSplit,
    setSplitPercentage,
  } = useRsTanSplitContext()

  const AssetSelectTemplate = (option: LockPositionSelectTemplate) => {
    return (
      <>
        {option && option?.tokenId ? (
          <div className="flex items-center">
            <span className="text-md font-semibold text-white">#{option.tokenId}</span>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="text-md font-semibold text-white"></span>
          </div>
        )}
      </>
    )
  }

  const PositionSelect = () => {
    if (!lockData || (!!lockData && lockData?.positions.length === 0)) {
      return (
        <InputSelect disabled={true} className="w-full min-w-32" template={AssetSelectTemplate} value={""} options={[]} onChange={(e) => setSplitPosition(e)} />
      )
    }

    const selectOptions = lockData?.positions?.map((el) => {
      return { ...el, value: el.tokenId.toString(), label: el.tokenId.toString() }
    })

    return (
      <InputSelect
        className="w-full min-w-32"
        template={AssetSelectTemplate}
        value={splitPosition || ""}
        options={selectOptions}
        onChange={(e) => setSplitPosition(e)}
      />
    )
  }

  return (
    <div className="flex w-full flex-col items-start justify-start">
      <div className="mb-1 text-lg font-semibold text-white">Select position to split:</div>

      <div className="flex w-full flex-col items-center justify-between gap-2 sm:flex-row">
        <PositionSelect />
        <div className="flex h-full w-full items-center justify-between gap-4 rounded-[10px] bg-overlay-panel px-3 py-1.5 text-[15px] text-sm text-subtitle backdrop-blur-[60px] backdrop-filter">
          Balance:
          {splitPositionInfo && splitPositionInfo?.amount && (
            <span className="flex items-center justify-end text-lg font-semibold text-white">
              {formatBigInt(splitPositionInfo?.amount, 18, 2)} <IconVsTan className="ml-2 h-5 w-5"></IconVsTan>
            </span>
          )}
        </div>
      </div>

      {splitPositionInfo && splitPositionInfo?.amount && (
        <>
          <div className="flex w-full flex-col items-start justify-start">
            <div className="mb-3 mt-6 text-lg font-semibold text-white">Choose splitting amount & positions:</div>

            <PanelRaw className="flex h-full w-full items-center justify-between gap-2 px-2 py-3">
              <div className="flex flex-col">
                <div className="text-xs font-semibold text-subtitle">You Split</div>
                <div className="text-xl">
                  <input
                    type="string"
                    disabled={true}
                    value={computedSplitAmounts?.firstSplit}
                    placeholder="Amount"
                    className="min-h-10 rounded-[10px] border-opacity-20 bg-transparent py-2 font-semibold focus:outline-none"
                  />
                </div>
                <div className="text-xs text-subtitle">($1,500)</div>
              </div>
              <div className="flex h-full items-end justify-end gap-3 xl:items-center xl:justify-center">
                <div className="hidden h-full flex-col items-center justify-center md:flex">
                  <div className="flex items-center justify-center gap-1 rounded-[10px] bg-overlay-panel px-3 py-2 font-semibold backdrop-blur-[60px]">
                    <IconVsTan className="h-4 w-4"></IconVsTan>
                    vsTan
                  </div>
                </div>
                <div className="flex h-full flex-col items-start justify-start">
                  <div className="mb-0.5 text-xs font-semibold text-subtitle">Position</div>
                  <div className="flex w-28 items-center justify-center gap-1 rounded-[10px] bg-overlay-panel px-3 py-2 backdrop-blur-[60px]">
                    <div className="text-md font-semibold">#{computedNewPositionIds?.newPositionId1}</div>
                    <div className="text-sm">(updated)</div>
                  </div>
                </div>
              </div>
            </PanelRaw>

            <PanelRaw className="mt-2 flex h-full w-full items-center justify-between gap-2 px-2 py-3">
              <div className="flex flex-col">
                <div className="text-xs font-semibold text-subtitle">You Split</div>
                <div className="text-xl">
                  <input
                    type="string"
                    disabled={true}
                    value={computedSplitAmounts?.secondSplit}
                    placeholder="Amount"
                    className="min-h-10 rounded-[10px] border-opacity-20 bg-transparent py-2 font-semibold focus:outline-none"
                  />
                </div>
                <div className="text-xs text-subtitle">($1,500)</div>
              </div>
              <div className="flex h-full items-end justify-end gap-3 xl:items-center xl:justify-center">
                <div className="hidden h-full flex-col items-center justify-center md:flex">
                  <div className="flex items-center justify-center gap-1 rounded-[10px] bg-overlay-panel px-3 py-2 font-semibold backdrop-blur-[60px]">
                    <IconVsTan className="h-4 w-4"></IconVsTan>
                    vsTan
                  </div>
                </div>
                <div className="flex h-full flex-col items-start justify-start">
                  <div className="mb-0.5 text-xs font-semibold text-subtitle">Position</div>
                  <div className="flex w-28 items-center justify-center gap-1 rounded-[10px] bg-overlay-panel px-3 py-2 backdrop-blur-[60px]">
                    <div className="text-md font-semibold">#{computedNewPositionIds?.newPositionId2}</div>
                    <div className="text-sm">(new)</div>
                  </div>
                </div>
              </div>
            </PanelRaw>

            <PanelRaw className="mt-2 flex w-full flex-col p-3">
              <input
                type="range"
                min="10"
                step={10}
                max="90"
                value={splitPercentage}
                onChange={(e) => setSplitPercentage(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#070707]"
                style={{
                  background: `linear-gradient(to right, #3b82f6 ${visualPercentage}%, #4b5563 ${visualPercentage}%)`,
                }}
              />

              <div className="mt-2 flex w-full items-center justify-center text-sm font-semibold text-white">
                <div className="flex w-full items-center justify-center text-sm font-semibold text-white">{splitPercentage}%</div>
                <div className="flex w-full items-center justify-center text-sm font-semibold text-white">{100 - splitPercentage}%</div>{" "}
              </div>

              <div className="mt-3 flex justify-between gap-4 text-subtitle">
                <div className="flex w-full items-center justify-between rounded-[10px] bg-overlay-panel pl-2 backdrop-blur-[60px]">
                  <span className="text-xs">
                    <span className="mr-2 font-semibold">Position</span>
                    <span className="font-semibold text-white"> #{computedNewPositionIds?.newPositionId1}</span>
                  </span>
                  <PanelRaw className="text-md flex min-w-16 items-center justify-center bg-button-active bg-clip-text font-semibold text-transparent">
                    {splitPercentage}%
                  </PanelRaw>
                </div>

                <div className="flex w-full items-center justify-between rounded-[10px] bg-overlay-panel pl-2 backdrop-blur-[60px]">
                  <span className="text-xs">
                    <span className="mr-2 font-semibold">Position</span>
                    <span className="font-semibold text-white"> #{computedNewPositionIds?.newPositionId2}</span>
                  </span>{" "}
                  <PanelRaw className="text-md flex min-w-16 items-center justify-center bg-button-active bg-clip-text font-semibold text-transparent">
                    {100 - splitPercentage}%
                  </PanelRaw>
                </div>
              </div>
            </PanelRaw>
          </div>

          <div className="mb-3 mt-6 text-lg font-semibold text-white">Split recap:</div>

          <div className="mb-2 flex w-full flex-col items-start justify-start gap-2 rounded-[10px] bg-overlay-panel px-2 py-3 backdrop-blur-[60px]">
            <div className="flex w-full items-start justify-start gap-2">
              <div className="w-3/12">Pos. ID</div>
              <div className="w-6/12">vsTan</div>
              <div className="w-3/12">Unlock date</div>
            </div>

            <div className="flex w-full items-center justify-center gap-2">
              <div className="flex h-10 w-3/12 items-center justify-start rounded-[10px] bg-overlay-panel px-4 font-semibold backdrop-blur-[60px]">
                #{splitPositionInfo?.tokenId}
                <div className="absolute right-0 top-0 flex w-[60px] justify-center rounded-[10px] bg-tonic py-0.5 text-xs text-black">Updated</div>
              </div>
              <EvolutionBox
                className="w-6/12"
                originalValue={
                  <div className="flex items-center justify-center gap-2 text-lg">
                    {formatBigInt(splitPositionInfo?.amount, 18, 2)} <IconVsTan className="h-5 w-5"></IconVsTan>
                  </div>
                }
                newValue={
                  <div className="flex items-center justify-center gap-2">
                    {formatBigInt(BigInt(splitPercentage / 10) * splitPositionInfo?.amount, 19, 2)} <IconVsTan className="h-5 w-5"></IconVsTan>
                  </div>
                }
              />
              <div className="flex h-10 w-3/12 items-center justify-center rounded-[10px] bg-overlay-panel px-4 backdrop-blur-[60px]">
                {splitPositionInfo?.endLockTime && splitPositionInfo?.endLockTime == "281474976710655" ? (
                  <InfinityIcon className="w-5"></InfinityIcon>
                ) : (
                  <> {formatDate(new Date(Number(splitPositionInfo?.endLockTime) * 1000), "dd/MM/yyyy")}</>
                )}
              </div>
            </div>

            <div className="flex w-full items-center justify-center gap-2">
              <div className="relative flex h-10 w-3/12 items-center justify-start rounded-[10px] bg-overlay-panel px-4 font-semibold backdrop-blur-[60px]">
                #{computedNewPositionIds?.newPositionId2}
                <div className="absolute right-0 top-0 flex w-[60px] justify-center rounded-[10px] bg-button-active py-0.5 text-xs text-black">New</div>
              </div>

              <EvolutionBox
                className="w-6/12"
                originalValue={
                  <div className="flex items-center justify-center gap-2">
                    0 <IconVsTan className="h-5 w-5"></IconVsTan>
                  </div>
                }
                newValue={
                  <div className="flex items-center justify-center gap-2">
                    {formatBigInt(BigInt((100 - splitPercentage) / 10) * splitPositionInfo?.amount, 19, 2)} <IconVsTan className="h-5 w-5"></IconVsTan>
                  </div>
                }
              />
              <div className="flex h-10 w-3/12 items-center justify-center rounded-[10px] bg-overlay-panel px-4 backdrop-blur-[60px]">
                {splitPositionInfo?.endLockTime && splitPositionInfo?.endLockTime == "281474976710655" ? (
                  <InfinityIcon className="w-5"></InfinityIcon>
                ) : (
                  <> {formatDate(new Date(Number(splitPositionInfo?.endLockTime) * 1000), "dd/MM/yyyy")}</>
                )}
              </div>
            </div>
          </div>

          <FormButtons
            actions={{
              handleApprove: undefined,
              handleProcess: actionSplit,
            }}
            formState={formState}
            labelProcess="Split"
          />
        </>
      )}
    </div>
  )
}
