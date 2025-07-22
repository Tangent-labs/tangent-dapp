"use client"

import InputSelect from "@/components/design_system/inputs/input_select"
import { useRsTanContext } from "../rstan_layout_context"
import { LockPositionSelectTemplate } from "../../tg_usd/tg_usd_type"
import { IconRsTan } from "@/components/icons/icon_rstan"
import { formatBigInt } from "@/lib/number_formatter"
import { useRsTanMergeContext } from "./rstan_merge_context"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import { formatDate } from "@/lib/other_formatter"
import { InfinityIcon } from "lucide-react"
import FormButtons from "@/components/design_system/form/form_actions"
import TokenImage from "@/components/design_system/structure/token_image"
import { Switch } from "@/components/ui/switch"

export const RsTanMergeContent = () => {
  const { lockData } = useRsTanContext()

  const {
    actionMerge,
    setSecondPositionToMerge,
    setFirstPositionToMerge,
    setClaimAsSUSG,
    firstPositionToMerge,
    formState,
    claimAsSUSG,
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
            <span className="font-semibold text-white">#{option.tokenId}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white"></span>
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
      <div className="mb-1 text-lg font-semibold text-white">Select positions to merge :</div>

      <div className="mt-2 flex h-10 w-full items-center justify-between gap-2">
        <PositionSelect />
        <div className="mt-1 flex h-full w-full items-center justify-between gap-4 rounded-[10px] bg-overlay-panel p-3 text-sm text-subtitle">
          Balance:
          {firstPositionToMerge && firstPositionToMergeInfo?.amount && (
            <span className="flex items-center justify-end text-lg font-semibold text-white">
              {formatBigInt(firstPositionToMergeInfo?.amount, 18, 2)} <IconRsTan className="ml-2 h-5 w-5"></IconRsTan>
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 flex h-10 w-full items-center justify-between gap-2">
        <SecondPositionSelect />
        <div className="mt-1 flex h-full w-full items-center justify-between gap-4 rounded-[10px] bg-overlay-panel p-3 text-sm text-subtitle">
          Balance:
          {secondPositionToMerge && secondPositionToMergeInfo?.amount && (
            <span className="flex items-center justify-end text-lg font-semibold text-white">
              {formatBigInt(secondPositionToMergeInfo?.amount, 18, 2)} <IconRsTan className="ml-2 h-5 w-5"></IconRsTan>
            </span>
          )}
        </div>
      </div>

      {secondPositionToMergeInfo && firstPositionToMergeInfo && (
        <>
          <div className="my-3 font-semibold text-white">Merge recap:</div>

          <div className="flex w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel px-2 py-3 backdrop-blur-[60px]">
            <div className="flex w-full items-start justify-start gap-2">
              <div className="w-3/12 text-subtitle">Pos. ID</div>
              <div className="w-6/12 text-subtitle">rsTan</div>
              <div className="w-3/12 text-subtitle">Unlock date</div>
            </div>

            <div className="my-1 flex w-full items-center justify-center gap-2 text-[16px]">
              <div className="relative flex h-10 w-3/12 items-center justify-start rounded-[10px] bg-overlay-panel px-4 font-semibold backdrop-blur-[60px]">
                #{firstPositionToMergeInfo?.tokenId}
                <div className="absolute right-0 top-0 flex w-[60px] justify-center rounded-[10px] bg-tonic py-0.5 text-xs text-black">Updated</div>
              </div>
              <EvolutionBox
                className="w-6/12"
                originalValue={
                  <div className="flex items-center justify-center font-semibold">
                    {formatBigInt(firstPositionToMergeInfo?.amount, 18, 2)} <IconRsTan className="ml-1 h-5 w-5"></IconRsTan>
                  </div>
                }
                newValue={
                  <div className="flex h-full items-center justify-center font-semibold">
                    {formatBigInt(secondPositionToMergeInfo?.amount + firstPositionToMergeInfo?.amount, 18, 2)}
                    <IconRsTan className="ml-1 h-5 w-5"></IconRsTan>
                  </div>
                }
              />
              <div className="flex h-10 w-3/12 items-center justify-center rounded-[10px] bg-overlay-panel px-4 backdrop-blur-[60px]">
                {(firstPositionToMergeInfo?.endLockTime && firstPositionToMergeInfo?.endLockTime == "281474976710655") ||
                (secondPositionToMergeInfo?.endLockTime && secondPositionToMergeInfo?.endLockTime == "281474976710655") ? (
                  <InfinityIcon className="w-5"></InfinityIcon>
                ) : (
                  <> {formatDate(new Date(Number(computedNewUnlockDate) * 1000), "dd/MM/yyyy")}</>
                )}
              </div>
            </div>

            <div className="my-1 flex w-full items-center justify-center gap-2 text-[16px]">
              <div className="relative flex h-10 w-3/12 items-center justify-start rounded-[10px] bg-overlay-panel px-4 font-semibold backdrop-blur-[60px]">
                #{secondPositionToMergeInfo?.tokenId}
                <div className="absolute right-0 top-0 flex w-[60px] justify-center rounded-[10px] bg-danger py-0.5 text-xs text-black">Deleted</div>
              </div>
              <EvolutionBox
                className="w-6/12"
                originalValue={
                  <div className="flex items-center justify-center font-semibold">
                    {formatBigInt(secondPositionToMergeInfo?.amount, 18, 2)} <IconRsTan className="ml-1 h-5 w-5"></IconRsTan>
                  </div>
                }
                newValue={
                  <div className="flex h-full items-center justify-center font-semibold">
                    - <IconRsTan className="ml-4 h-5 w-5"></IconRsTan>
                  </div>
                }
              />
              <div className="flex h-10 w-3/12 items-center justify-center rounded-[10px] bg-overlay-panel px-4 backdrop-blur-[60px]">-</div>
            </div>
          </div>

          <div className="mb-1 mt-4 flex w-full items-center justify-between font-semibold">
            <div className="my-3 font-semibold text-white">Claim recap:</div>

            <div className="flex items-center justify-center gap-2 text-xs text-subtitle">
              Claim as sUSG <Switch checked={claimAsSUSG} onCheckedChange={() => setClaimAsSUSG(!claimAsSUSG)} />
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-around gap-2 rounded-[10px] p-3 backdrop-blur-[10px]">
            <div className="flex w-full flex-col items-start justify-start">
              <div className="flex w-full items-start justify-start">
                <div className="flex w-1/2 items-start justify-start text-subtitle">Position ID</div>

                <div className="flex w-1/2 items-start justify-start text-subtitle"> {claimAsSUSG ? "sUSG" : "USG"} received</div>
              </div>

              <div className="my-1 flex w-full items-center gap-2">
                <div className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-overlay-panel py-1 backdrop-blur-[10px]">
                  #{secondPositionToMergeInfo.tokenId}
                </div>
                <div className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-overlay-panel backdrop-blur-[10px]">
                  {formatBigInt(secondPositionToMergeInfo.claimable, 18, 2)}
                  <TokenImage token={claimAsSUSG ? "sUSG" : "USG"} className="" size={16} />
                </div>
              </div>
            </div>
          </div>

          <FormButtons actions={{ handleApprove: undefined, handleProcess: actionMerge }} formState={formState} labelProcess="Merge" />
        </>
      )}
    </div>
  )
}
