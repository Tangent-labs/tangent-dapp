"use client"

import { parseUnits } from "viem"
import { useEffect, useRef, useState } from "react"
import { InputSelect } from "@/components/design_system/inputs/input_select"
import { useVsTanContext } from "../rstan_layout_context"
import { FormAlert } from "@/components/design_system/inputs/form_alert"
import { isPermaLocked } from "../rstan_layout_controller"
import { LockPositionSelectTemplate } from "../../usg/usg_type"
import { formatBigInt, formatBigIntFloor } from "@/lib/number_formatter"
import { useVsTanSplitContext } from "./rstan_split_context"
import { PanelRaw } from "@/components/design_system/structure/panel_raw"
import { formatDate } from "@/lib/other_formatter"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { IconOpenOutside } from "@/components/icons"
import FormButtons from "@/components/design_system/form/form_actions"
import { IconInfinity } from "@/components/icons/icon_infinity"
import { TokenImage } from "@/components/design_system/structure/token_image"

/**
 * Editable amount field. Keeps its own display string while focused so a half-typed value like
 * "12." survives, and re-syncs from the source of truth whenever the slider or the other side moves.
 */
const SplitAmountInput = ({ value, onChange, disabled }: { value: bigint; onChange: (value: bigint) => void; disabled?: boolean }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const [localDisplay, setLocalDisplay] = useState<string>("")

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setLocalDisplay(formatBigIntFloor(value, 18, 2))
    }
  }, [value])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(",", ".").trim()

    if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return

    setLocalDisplay(raw)

    if (raw === "" || raw === ".") {
      onChange(0n)
      return
    }

    try {
      onChange(parseUnits(raw, 18))
    } catch {
      // half-typed values are simply not committed
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      lang="en"
      disabled={disabled}
      value={localDisplay}
      onChange={handleChange}
      onBlur={() => setLocalDisplay(formatBigIntFloor(value, 18, 2))}
      placeholder="Amount"
      className="min-h-10 w-full rounded-[10px] border-opacity-10 bg-transparent py-2 font-semibold focus:outline-none"
    />
  )
}

export const VsTanSplitContent = () => {
  const { lockData } = useVsTanContext()

  const { connect } = useWalletConnexionContext()

  const {
    isLoading,
    splitPosition,
    splitPositionInfo,
    splitPercentage,
    computedNewPositionIds,
    computedSplitAmounts,
    firstSplitAmount,
    secondSplitAmount,
    setFirstSplitAmount,
    setSecondSplitAmount,
    visualPercentage,
    formState,
    setSplitPosition,
    actionSplit,
    setSplitPercentage,
  } = useVsTanSplitContext()

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
      <div className="mb-1 text-xl font-semibold text-white">Select position to split:</div>

      <div className="mt-2 flex h-10 w-full items-center justify-between gap-2">
        <PositionSelect />
        <div className="mt-1 flex h-full w-full items-center justify-between gap-4 rounded-[10px] bg-overlay-panel p-3 text-sm text-subtitle">
          Balance:
          {splitPositionInfo && splitPositionInfo?.amount && (
            <span className="flex items-center justify-end text-lg font-semibold text-white">
              {formatBigInt(splitPositionInfo?.amount, 18, 2)} <TokenImage token="VSTAN" size={16} className="ml-2 w-4" />
            </span>
          )}
        </div>
      </div>

      {splitPositionInfo && splitPositionInfo?.amount && (
        <>
          <div className="flex w-full flex-col items-start justify-start">
            <div className="mb-2 mt-4 text-xl font-semibold text-white">Choose splitting amount & positions:</div>

            <PanelRaw className="flex h-full w-full items-center justify-between gap-2 px-2 py-3">
              <div className="flex flex-col">
                <div className="text-xs font-semibold text-subtitle">You Split</div>
                <div className="text-xl">
                  <SplitAmountInput value={firstSplitAmount} onChange={setFirstSplitAmount} disabled={isLoading} />
                </div>
                <div className="text-xs text-subtitle">{computedSplitAmounts?.firstSplitDollar && `(${computedSplitAmounts.firstSplitDollar})`}</div>
              </div>
              <div className="flex h-full items-end justify-end gap-3 xl:items-center xl:justify-center">
                <div className="hidden h-full flex-col items-center justify-center md:flex">
                  <div className="flex items-center justify-center gap-1 rounded-[10px] bg-overlay-panel px-3 py-2 font-semibold backdrop-blur-[60px]">
                    <TokenImage token="VSTAN" size={16} className="w-4" />
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
                  <SplitAmountInput value={secondSplitAmount} onChange={setSecondSplitAmount} disabled={isLoading} />
                </div>
                <div className="text-xs text-subtitle">{computedSplitAmounts?.secondSplitDollar && `(${computedSplitAmounts.secondSplitDollar})`}</div>
              </div>
              <div className="flex h-full items-end justify-end gap-3 xl:items-center xl:justify-center">
                <div className="hidden h-full flex-col items-center justify-center md:flex">
                  <div className="flex items-center justify-center gap-1 rounded-[10px] bg-overlay-panel px-3 py-2 font-semibold backdrop-blur-[60px]">
                    <TokenImage token="VSTAN" size={16} className="w-4" />
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
                min="1"
                step={0.01}
                max="99"
                value={Math.min(99, Math.max(1, splitPercentage))}
                onChange={(e) => setSplitPercentage(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-[10px] bg-dark"
                style={{
                  background: `linear-gradient(to right, #3b82f6 ${visualPercentage}%, #4b5563 ${visualPercentage}%)`,
                }}
              />

              <div className="mt-3 flex justify-between gap-4 text-subtitle">
                <div className="flex w-full items-center justify-between rounded-[10px] bg-overlay-panel pl-2 backdrop-blur-[60px]">
                  <span className="text-xs">
                    <span className="mr-2 font-semibold">Position</span>
                    <span className="font-semibold text-white"> #{computedNewPositionIds?.newPositionId1}</span>
                  </span>
                  <PanelRaw className="text-md flex min-w-16 items-center justify-center font-semibold text-row-tonic">
                    {Number(splitPercentage.toFixed(2))}%
                  </PanelRaw>
                </div>

                <div className="flex w-full items-center justify-between rounded-[10px] bg-overlay-panel pl-2 backdrop-blur-[60px]">
                  <span className="text-xs">
                    <span className="mr-2 font-semibold">Position</span>
                    <span className="font-semibold text-white"> #{computedNewPositionIds?.newPositionId2}</span>
                  </span>{" "}
                  <PanelRaw className="text-md flex min-w-16 items-center justify-center font-semibold text-row-tonic">
                    {Number((100 - splitPercentage).toFixed(2))}%
                  </PanelRaw>
                </div>
              </div>
            </PanelRaw>
          </div>

          <div className="mb-2 mt-4 text-lg font-semibold text-white">Split recap:</div>

          <div className="mb-2 flex w-full flex-col items-start justify-start gap-2 rounded-[10px] bg-overlay-panel px-2 py-3">
            <div className="flex w-full items-start justify-start gap-2">
              <div className="w-3/12">Pos. ID</div>
              <div className="w-6/12">vsTan</div>
              <div className="w-3/12">Unlock date</div>
            </div>

            {/* Both rows mirror the header widths above : 3/12 - 6/12 - 3/12 */}
            <div className="flex w-full items-center gap-2">
              <div className="relative flex h-8 w-3/12 items-center justify-start rounded-[10px] bg-overlay-panel px-4 font-semibold">
                #{splitPositionInfo?.tokenId}
                <div className="absolute right-0 top-0 flex w-[60px] justify-center rounded-[10px] bg-tonic py-0.5 text-xs text-black">Updated</div>
              </div>

              <div className="flex h-8 w-6/12 items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 font-semibold">
                {computedSplitAmounts?.firstSplit}
                <TokenImage token="VSTAN" size={16} className="w-4" />
              </div>

              <div className="flex h-8 w-3/12 items-center justify-center rounded-[10px] bg-overlay-panel px-4">
                {isPermaLocked(splitPositionInfo) ? (
                  <IconInfinity className="w-4" />
                ) : (
                  <> {formatDate(new Date(Number(splitPositionInfo?.endLockTime) * 1000), "dd/MM/yyyy")}</>
                )}
              </div>
            </div>

            <div className="flex w-full items-center gap-2">
              <div className="relative flex h-8 w-3/12 items-center justify-start rounded-[10px] bg-overlay-panel px-4 font-semibold">
                #{computedNewPositionIds?.newPositionId2}
                <div className="absolute right-0 top-0 flex w-[60px] justify-center rounded-[10px] bg-button-active py-0.5 text-xs text-black">New</div>
              </div>

              <div className="flex h-8 w-6/12 items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 font-semibold">
                {computedSplitAmounts?.secondSplit}
                <TokenImage token="VSTAN" size={16} className="w-4" />
              </div>

              <div className="flex h-8 w-3/12 items-center justify-center rounded-[10px] bg-overlay-panel px-4">
                {isPermaLocked(splitPositionInfo) ? (
                  <IconInfinity className="w-4" />
                ) : (
                  <> {formatDate(new Date(Number(splitPositionInfo?.endLockTime) * 1000), "dd/MM/yyyy")}</>
                )}
              </div>
            </div>
          </div>

          <div className="my-2 flex rounded-[10px] bg-overlay-panel p-2 text-xs text-subtitle">
            <span>The newly created positions will share the same unlock schedule. </span>
            <span onClick={() => window.open("https://youtu.be/5Hplx-geZHo?t=5")} className="ml-1 flex cursor-pointer items-center underline hover:text-white">
              Learn more <IconOpenOutside className="ml-1 mt-1 w-3" />
            </span>
          </div>

          {formState.errors
            .filter((e) => e.type === "form-alert")
            .map((error) => (
              <FormAlert key={error.key} error={error} className="my-1" isLoading={isLoading} />
            ))}

          <FormButtons
            actions={{
              handleApprove: undefined,
              handleProcess: actionSplit,
            }}
            connect={connect}
            formState={formState}
            labelProcess="Split"
          />
        </>
      )}
    </div>
  )
}
