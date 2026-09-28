"use client"

import { Switch } from "@/components/ui/switch"
import { formatDate } from "@/lib/other_formatter"
import { formatBigInt } from "@/lib/number_formatter"
import { useVsTanContext } from "../rstan_layout_context"
import { FormAlert } from "@/components/design_system/inputs/form_alert"
import { isPermaLocked } from "../rstan_layout_controller"
import { useVsTanMergeContext } from "./rstan_merge_context"
import { LockPositionSelectTemplate } from "../../usg/usg_type"
import { IconOpenOutside } from "@/components/icons"
import FormButtons from "@/components/design_system/form/form_actions"
import { InputSelect } from "@/components/design_system/inputs/input_select"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { IconInfinity } from "@/components/icons/icon_infinity"

export const VsTanMergeContent = () => {
  const { lockData } = useVsTanContext()

  const { connect } = useWalletConnexionContext()

  const {
    isLoading,
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
    computedNewAmount,
  } = useVsTanMergeContext()

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
      <div className="mb-1 text-xl font-semibold text-white">Select positions to merge :</div>

      <div className="mt-2 flex h-10 w-full items-center justify-between gap-2">
        <PositionSelect />
        <div className="mt-1 flex h-full w-full items-center justify-between gap-4 rounded-[10px] bg-overlay-panel p-3 text-sm text-subtitle">
          Balance:
          {firstPositionToMerge && firstPositionToMergeInfo?.amount && (
            <span className="flex items-center justify-end text-lg font-semibold text-white">
              {formatBigInt(firstPositionToMergeInfo?.amount, 18, 2)} <TokenImage token="VSTAN" size={16} className="ml-2 w-4" />
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
              {formatBigInt(secondPositionToMergeInfo?.amount, 18, 2)} <TokenImage token="VSTAN" size={16} className="ml-2 w-4" />
            </span>
          )}
        </div>
      </div>

      {secondPositionToMergeInfo && firstPositionToMergeInfo && (
        <>
          <div className="my-3 font-semibold text-white">Merge recap:</div>

          <div className="flex w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel px-2 py-3">
            <div className="flex w-full items-start justify-start gap-2">
              <div className="w-1/3 text-[15px] text-subtitle sm:w-3/12">Pos. ID</div>
              <div className="w-8/12 text-[15px] text-subtitle sm:w-6/12">vsTan</div>
              <div className="hidden w-3/12 text-[15px] text-subtitle sm:flex">Unlock date</div>
            </div>

            {/* Both rows mirror the header widths above : 1/3 - 8/12 - hidden, then 3/12 - 6/12 - 3/12 from sm */}
            <div className="my-1 flex w-full items-center gap-2 text-[16px]">
              <div className="relative flex h-8 w-1/3 items-center justify-start rounded-[10px] bg-overlay-panel px-4 font-semibold sm:w-3/12">
                #{firstPositionToMergeInfo?.tokenId}
                <div className="absolute right-0 top-0 flex w-[60px] justify-center rounded-[10px] bg-tonic py-0.5 text-xs text-black">Updated</div>
              </div>

              {/* The surviving position ends up holding both balances */}
              <div className="flex h-8 w-8/12 items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 font-semibold sm:w-6/12">
                {formatBigInt(computedNewAmount, 18, 2)}
                <TokenImage token="VSTAN" size={16} className="w-4" />
              </div>

              <div className="hidden h-8 w-3/12 items-center justify-center rounded-[10px] bg-overlay-panel px-4 sm:flex">
                {isPermaLocked(firstPositionToMergeInfo) || isPermaLocked(secondPositionToMergeInfo) ? (
                  <IconInfinity className="w-4" />
                ) : (
                  <> {formatDate(new Date(Number(computedNewUnlockDate) * 1000), "dd/MM/yyyy")}</>
                )}
              </div>
            </div>

            <div className="my-1 flex w-full items-center gap-2 text-[16px]">
              <div className="relative flex h-8 w-1/3 items-center justify-start rounded-[10px] bg-overlay-panel px-4 font-semibold sm:w-3/12">
                #{secondPositionToMergeInfo?.tokenId}
                <div className="absolute right-0 top-0 flex w-[60px] justify-center rounded-[10px] bg-danger py-0.5 text-xs text-black">Deleted</div>
              </div>

              {/* Emptied into the position above, so it ends at zero */}
              <div className="flex h-8 w-8/12 items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 font-semibold text-subtitle sm:w-6/12">
                {formatBigInt(secondPositionToMergeInfo?.amount, 18, 2)}
                <TokenImage token="VSTAN" size={16} className="w-4" />
                <span className="text-sm">→ 0</span>
              </div>

              <div className="hidden h-8 w-3/12 items-center justify-center rounded-[10px] bg-overlay-panel px-4 sm:flex">-</div>
            </div>

            <div className="flex h-8 w-full items-center justify-center rounded-[10px] bg-overlay-panel px-4 sm:hidden">
              {isPermaLocked(firstPositionToMergeInfo) || isPermaLocked(secondPositionToMergeInfo) ? (
                <IconInfinity className="w-4" />
              ) : (
                <> Unlock Date {formatDate(new Date(Number(computedNewUnlockDate) * 1000), "dd/MM/yyyy")}</>
              )}
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
                <div className="flex w-1/2 items-start justify-start text-[15px] text-subtitle">Position ID</div>

                <div className="flex w-1/2 items-start justify-start text-[15px] text-subtitle"> {claimAsSUSG ? "sUSG" : "USG"} received</div>
              </div>

              <div className="my-1 flex w-full items-center gap-2">
                <div className="flex h-8 w-full items-center justify-center gap-2 rounded-[10px] bg-overlay-panel py-1 backdrop-blur-[10px]">
                  #{secondPositionToMergeInfo.tokenId}
                </div>
                <div className="flex h-8 w-full items-center justify-center gap-2 rounded-[10px] bg-overlay-panel backdrop-blur-[10px]">
                  {formatBigInt(secondPositionToMergeInfo.claimable, 18, 2)}
                  <TokenImage token={claimAsSUSG ? "sUSG" : "USG"} className="" size={16} />
                </div>
              </div>
            </div>
          </div>

          <div className="my-2 rounded-[10px] bg-overlay-panel p-2 text-xs text-subtitle">
            <span>The newly created position will share the same unlock schedule as the longest one, prior to the merge. </span>
            <span
              onClick={() => window.open("https://youtu.be/5Hplx-geZHo?t=5")}
              className="inline-flex cursor-pointer items-center underline hover:text-white"
            >
              Learn more <IconOpenOutside className="ml-1 mt-1 w-3" />
            </span>
          </div>

          {formState.errors
            .filter((e) => e.type === "form-alert")
            .map((error) => (
              <FormAlert key={error.key} error={error} className="my-1" isLoading={isLoading} />
            ))}

          <FormButtons connect={connect} actions={{ handleApprove: undefined, handleProcess: actionMerge }} formState={formState} labelProcess="Merge" />
        </>
      )}
    </div>
  )
}
