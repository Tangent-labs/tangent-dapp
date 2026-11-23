"use client"

import { useEffect, useRef, useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { LockPosition } from "@/components/products/usg/usg_type"
import { formatDate } from "@/lib/other_formatter"
import { formatBigInt, formatBigIntFloor } from "@/lib/number_formatter"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/design_system/inputs/button"
import FormButtons from "@/components/design_system/form/form_actions"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { IconInfinity } from "@/components/icons/icon_infinity"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { useVsTanContext } from "@/components/products/vs_tan/vstan_layout_context"
import { isPermaLocked } from "@/components/products/vs_tan/vstan_layout_controller"
import { useSUsgReceived } from "@/components/products/vs_tan/use_susg_received"
import { useVsTanLockContext } from "@/components/products/vs_tan/lock/vstan_lock_context"
import { useVsTanClaimContext } from "@/components/products/vs_tan/claim/rstan_claim_context"
import { useVsTanUnlockContext } from "@/components/products/vs_tan/unlock/rstan_unlock_context"
import { UnlockMode } from "@/components/products/vs_tan/unlock/rstan_unlock_controller"
import { useVsTanSplitContext } from "@/components/products/vs_tan/split/rstan_split_context"
import { useVsTanMergeContext } from "@/components/products/vs_tan/merge/rstan_merge_context"
import { Alerts, Field, Note, PositionPicker, Recap, Row } from "./parts"

const VsTan = ({ children }: { children?: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1.5">
    {children}
    <TokenImage token="VSTAN" size={16} className="h-4 w-4" />
  </span>
)

const unlockDate = (p: { endLockTime?: string | bigint } | undefined) =>
  !p ? "-" : isPermaLocked(p) ? <IconInfinity className="h-auto w-4" /> : formatDate(new Date(Number(p.endLockTime) * 1000), "dd/MM/yyyy")

const ClaimAsToggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-2">
    Claim as sUSG
    <Switch checked={checked} onCheckedChange={onChange} />
  </label>
)

/* ───────────── Lock ───────────── */

export function LockFormV2() {
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
    computedNewEndLockDate,
    setDepositPosition,
    actionLock,
    actionApprove,
    setIsPermaLock,
    handleDepositChange,
  } = useVsTanLockContext()
  const isNew = depositPosition === "New"

  return (
    <div>
      <Field label="Position">
        <PositionPicker value={depositPosition} onChange={setDepositPosition} lockData={lockData} extra={[{ value: "New", label: "New position" }]} />
      </Field>

      <div className="mt-5">
        <Field label="You deposit" aside={maxAmountToDeposit}>
          <GenericInputAssetAmount
            inputWeiValue={depositWeiValue}
            onValueChange={handleDepositChange}
            depositSelect={<StaticCardAssetInput assetName="TAN" logoKey="TAN" />}
            asset={depositAssetInfo}
            label="You deposit"
            maxAmountParams={{ maxWeiValue: maxDepositWeiValue, setMaxAmount: () => handleDepositChange(maxDepositWeiValue) }}
          />
        </Field>
      </div>

      <Recap title="Position after locking">
        <Row
          label="vsTAN"
          value={<VsTan>{depositPositionInfo ? `${formatBigInt(depositPositionInfo.amount, 18, 2)} → ${computedNewLockValue}` : computedNewLockValue}</VsTan>}
          strong
        />
        <Row label="Unlock date" value={computedNewEndLockDate} />
        {isNew && (
          <div className="flex items-center justify-between pt-1 text-[13px]">
            <span className="text-ink-3">Permalock</span>
            <Switch checked={isPermaLock} onCheckedChange={() => setIsPermaLock(!isPermaLock)} />
          </div>
        )}
      </Recap>

      <Note>Locking more tokens on an existing position automatically extends the lock to its maximum (13 weeks).</Note>
      <Alerts errors={formState.errors} isLoading={isLoading} />
      <div className="mt-5">
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

/* ───────────── Claim ───────────── */

export function ClaimFormV2() {
  const { lockData } = useVsTanContext()
  const { connect } = useWalletConnexionContext()
  const {
    claimAsSUSG,
    selectedPositions,
    selectedPositionsData,
    actionClaim,
    setClaimAsSUSG,
    setSelectedPositions,
    formState,
    isLoading,
    receivedTotal,
    receivedFor,
    claimableDollarValue,
  } = useVsTanClaimContext()
  const positions = lockData?.positions ?? []
  const allSelected = positions.length > 0 && selectedPositions.length === positions.length
  const toggle = (id: string) => setSelectedPositions(selectedPositions.includes(id) ? selectedPositions.filter((x) => x !== id) : [...selectedPositions, id])
  const out = claimAsSUSG ? "sUSG" : "USG"

  return (
    <div>
      <Field
        label="Positions to claim"
        aside={
          positions.length > 0 && (
            <button
              type="button"
              className="hover:text-white"
              onClick={() => setSelectedPositions(allSelected ? [] : positions.map((p) => p.tokenId.toString()))}
            >
              {allSelected ? "Clear" : "Select all"}
            </button>
          )
        }
      >
        <div className="space-y-1">
          {positions.length === 0 && <p className="rounded-xl bg-white/[0.03] px-4 py-5 text-center text-[13px] text-ink-3">No locked position.</p>}
          {positions.map((p: LockPosition) => {
            const id = p.tokenId.toString()
            const on = selectedPositions.includes(id)
            return (
              <button
                key={id}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors",
                  on ? "bg-white/[0.06]" : "hover:bg-white/[0.035]"
                )}
              >
                <span className={cn("grid h-5 w-5 place-items-center rounded-md border", on ? "border-action bg-action" : "border-white/20")}>
                  {on && <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />}
                </span>
                <span className="text-[14px] font-semibold">#{id}</span>
                <span className="ml-auto flex items-center gap-1.5 text-[13px] tabular-nums text-ink-2">
                  {formatBigInt(p.claimable, 18, 2)} <TokenImage token="USG" size={16} className="h-4 w-4" />
                </span>
              </button>
            )
          })}
        </div>
      </Field>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink-2">You receive</span>
        <ClaimAsToggle checked={claimAsSUSG} onChange={() => setClaimAsSUSG(!claimAsSUSG)} />
      </div>
      <div className="mt-2 flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3.5">
        <div>
          <div className="text-[24px] font-medium tabular-nums tracking-[-0.02em]">{formatBigInt(receivedTotal, 18, 2)}</div>
          <div className="text-xs text-ink-3">{claimableDollarValue}</div>
        </div>
        <span className="flex items-center gap-2 text-[14px] font-semibold">
          <TokenImage token={out} size={20} className="h-5 w-5" /> {out}
        </span>
      </div>

      {selectedPositionsData.length > 0 && (
        <Recap title="Claim recap">
          {selectedPositionsData.map((p: LockPosition) => (
            <Row
              key={p.tokenId.toString()}
              label={`#${p.tokenId}`}
              value={
                <>
                  {formatBigInt(receivedFor(p), 18, 2)} {out}
                </>
              }
            />
          ))}
        </Recap>
      )}

      <Note>Rewards can be claimed separately, or all together.</Note>
      <Alerts errors={formState.errors} isLoading={isLoading} />
      <div className="mt-5">
        <FormButtons actions={{ handleProcess: actionClaim }} connect={connect} formState={formState} isLoading={isLoading} labelProcess="Claim" />
      </div>
    </div>
  )
}

/* ───────────── Unlock ───────────── */

const processLabels: Record<UnlockMode, string> = { none: "Unlock", perma: "Remove perma-lock", locked: "Unlock", expired: "Unlock", kickable: "Unlock" }

export function UnlockFormV2() {
  const { lockData } = useVsTanContext()
  const { connect } = useWalletConnexionContext()
  const {
    isLoading,
    unlockPosition,
    setUnlockPosition,
    unlockPositionInfo,
    mode,
    formState,
    tanReceived,
    tanForfeited,
    claimAsSUSG,
    setClaimAsSUSG,
    kickParams,
    kickablePositions,
    actionProcess,
    actionKick,
  } = useUnlock()
  const claimReceived = useSUsgReceived(unlockPositionInfo?.claimable, claimAsSUSG)
  const out = claimAsSUSG ? "sUSG" : "USG"
  const has = !!unlockPositionInfo?.amount

  return (
    <div>
      <Field label="Position to unlock">
        <PositionPicker value={unlockPosition} onChange={setUnlockPosition} lockData={lockData} />
      </Field>

      {mode === "perma" ? (
        <Note>
          This position is perma-locked. Removing the perma-lock reverts it to a standard 13-week lock. Once that lock expires, the position can be unlocked
          without penalty.
        </Note>
      ) : (
        <Recap title="Unlock recap">
          <Row label="TAN received" value={<VsTan>{has ? formatBigInt(tanReceived, 18, 2) : "0"}</VsTan>} strong />
          <Row label="TAN forfeited" value={<VsTan>{has ? formatBigInt(tanForfeited, 18, 2) : "0"}</VsTan>} />
        </Recap>
      )}

      {unlockPositionInfo && mode !== "perma" && (
        <Recap title="Rewards claimed with it">
          <div className="-mt-1 mb-1 flex justify-end">
            <ClaimAsToggle checked={claimAsSUSG} onChange={() => setClaimAsSUSG(!claimAsSUSG)} />
          </div>
          <Row
            label={`#${unlockPositionInfo.tokenId}`}
            value={
              <>
                {formatBigInt(claimReceived, 18, 2)} {out}
              </>
            }
          />
        </Recap>
      )}

      {mode === "locked" && <Note learnMore>A penalty is applied for early unlocks (before the initial unlock schedule).</Note>}
      {mode === "kickable" && (
        <Note>This position is past the kick delay: anyone can kick it and collect a bounty on your TAN. Unlock it to withdraw in full.</Note>
      )}

      <Alerts errors={formState.errors} isLoading={isLoading} />
      <div className="mt-5">
        <FormButtons
          formState={formState}
          actions={{ handleProcess: actionProcess }}
          labelProcess={processLabels[mode]}
          connect={connect}
          isLoading={isLoading}
        />
      </div>

      {kickablePositions.length > 0 && kickParams && (
        <Recap title="Kickable positions">
          <p className="-mt-1 pb-1 text-xs text-ink-3">
            These positions passed the kick delay. Kick them to withdraw the owner&apos;s TAN and collect a {Number(kickParams.percentage) / 1000}% bounty.
          </p>
          {kickablePositions.map(({ position, bounty }) => (
            <div key={position.tokenId.toString()} className="flex items-center justify-between gap-3 rounded-[10px] bg-white/[0.03] px-3 py-2 text-[13px]">
              <span className="font-semibold">#{position.tokenId.toString()}</span>
              <VsTan>{formatBigInt(position.amount, 18, 2)}</VsTan>
              <span className="text-ink-3">Bounty {formatBigInt(bounty, 18, 4)}</span>
              <Button size="sm" disabled={isLoading} onClick={() => actionKick(position.tokenId)}>
                Kick
              </Button>
            </div>
          ))}
        </Recap>
      )}
    </div>
  )
}
const useUnlock = useVsTanUnlockContext

/* ───────────── Split ───────────── */

/** Amount field keeping its own text while focused so "12." survives; re-syncs from the source of truth. */
function SplitAmount({ value, onChange, disabled }: { value: bigint; onChange: (v: bigint) => void; disabled?: boolean }) {
  const ref = useRef<HTMLInputElement>(null)
  const [text, setText] = useState("")
  useEffect(() => {
    if (document.activeElement !== ref.current) setText(formatBigIntFloor(value, 18, 2))
  }, [value])
  return (
    <input
      ref={ref}
      type="text"
      inputMode="decimal"
      lang="en"
      disabled={disabled}
      value={text}
      placeholder="Amount"
      onChange={(e) => {
        const raw = e.target.value.replace(",", ".").trim()
        if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return
        setText(raw)
        if (raw === "" || raw === ".") return onChange(0n)
        try {
          const [i, d = ""] = raw.split(".")
          onChange(BigInt(i || "0") * 10n ** 18n + BigInt((d + "0".repeat(18)).slice(0, 18)))
        } catch {
          /* ignore half-typed input */
        }
      }}
      onBlur={() => {
        setText(formatBigIntFloor(value, 18, 2))
        onChange(value)
      }}
      className="w-full bg-transparent text-[22px] font-medium tabular-nums tracking-[-0.02em] outline-none placeholder:text-ink-3"
    />
  )
}

export function SplitFormV2() {
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
  const has = !!splitPositionInfo?.amount

  return (
    <div>
      <Field label="Position to split" aside={has && <VsTan>{formatBigInt(splitPositionInfo!.amount, 18, 2)}</VsTan>}>
        <PositionPicker value={splitPosition} onChange={setSplitPosition} lockData={lockData} />
      </Field>

      {has && (
        <>
          <div className="mt-5 space-y-2">
            {[
              {
                id: computedNewPositionIds?.newPositionId1,
                tag: "updated",
                amount: firstSplitAmount,
                set: setFirstSplitAmount,
                usd: computedSplitAmounts?.firstSplitDollar,
              },
              {
                id: computedNewPositionIds?.newPositionId2,
                tag: "new",
                amount: secondSplitAmount,
                set: setSecondSplitAmount,
                usd: computedSplitAmounts?.secondSplitDollar,
              },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <div className="text-xs text-ink-3">
                    Position #{s.id?.toString()} ({s.tag})
                  </div>
                  <SplitAmount value={s.amount} onChange={s.set} disabled={isLoading} />
                  <div className="text-xs text-ink-3">{s.usd && `(${s.usd})`}</div>
                </div>
                <VsTan>vsTAN</VsTan>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <input
              type="range"
              min="1"
              max="99"
              step={0.01}
              value={Math.min(99, Math.max(1, splitPercentage))}
              onChange={(e) => setSplitPercentage(Number(e.target.value))}
              aria-label="Split ratio"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
              style={{ background: `linear-gradient(to right, #0075FF ${visualPercentage}%, rgba(255,255,255,0.12) ${visualPercentage}%)` }}
            />
            <div className="mt-2 flex justify-between text-xs tabular-nums text-ink-2">
              <span>
                #{computedNewPositionIds?.newPositionId1?.toString()} · {Number(splitPercentage.toFixed(2))}%
              </span>
              <span>
                #{computedNewPositionIds?.newPositionId2?.toString()} · {Number((100 - splitPercentage).toFixed(2))}%
              </span>
            </div>
          </div>

          <Recap title="Split recap">
            <Row label={`#${splitPositionInfo?.tokenId} (updated)`} value={<VsTan>{computedSplitAmounts?.firstSplit}</VsTan>} />
            <Row label={`#${computedNewPositionIds?.newPositionId2?.toString()} (new)`} value={<VsTan>{computedSplitAmounts?.secondSplit}</VsTan>} />
            <Row label="Unlock date" value={unlockDate(splitPositionInfo)} />
          </Recap>

          <Note learnMore>The newly created positions share the same unlock schedule.</Note>
          <Alerts errors={formState.errors} isLoading={isLoading} />
          <div className="mt-5">
            <FormButtons actions={{ handleApprove: undefined, handleProcess: actionSplit }} connect={connect} formState={formState} labelProcess="Split" />
          </div>
        </>
      )}
    </div>
  )
}

/* ───────────── Merge ───────────── */

export function MergeFormV2() {
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
  const claimReceived = useSUsgReceived(secondPositionToMergeInfo?.claimable, claimAsSUSG)
  const out = claimAsSUSG ? "sUSG" : "USG"
  const ready = !!firstPositionToMergeInfo && !!secondPositionToMergeInfo

  return (
    <div>
      <Field label="Position kept" aside={firstPositionToMergeInfo?.amount && <VsTan>{formatBigInt(firstPositionToMergeInfo.amount, 18, 2)}</VsTan>}>
        <PositionPicker value={firstPositionToMerge} onChange={setFirstPositionToMerge} lockData={lockData} />
      </Field>
      <div className="mt-4">
        <Field
          label="Position merged into it"
          aside={secondPositionToMergeInfo?.amount && <VsTan>{formatBigInt(secondPositionToMergeInfo.amount, 18, 2)}</VsTan>}
        >
          <PositionPicker value={secondPositionToMerge} onChange={setSecondPositionToMerge} lockData={lockData} />
        </Field>
      </div>

      {ready && (
        <>
          <Recap title="Merge recap">
            <Row label={`#${firstPositionToMergeInfo!.tokenId} (updated)`} value={<VsTan>{formatBigInt(computedNewAmount, 18, 2)}</VsTan>} strong />
            <Row
              label={`#${secondPositionToMergeInfo!.tokenId} (deleted)`}
              value={<VsTan>{formatBigInt(secondPositionToMergeInfo!.amount, 18, 2)} → 0</VsTan>}
            />
            <Row
              label="Unlock date"
              value={
                isPermaLocked(firstPositionToMergeInfo) || isPermaLocked(secondPositionToMergeInfo) ? (
                  <IconInfinity className="h-auto w-4" />
                ) : (
                  formatDate(new Date(Number(computedNewUnlockDate) * 1000), "dd/MM/yyyy")
                )
              }
            />
          </Recap>

          <Recap title="Rewards claimed with it">
            <div className="-mt-1 mb-1 flex justify-end">
              <ClaimAsToggle checked={claimAsSUSG} onChange={() => setClaimAsSUSG(!claimAsSUSG)} />
            </div>
            <Row
              label={`#${secondPositionToMergeInfo!.tokenId}`}
              value={
                <>
                  {formatBigInt(claimReceived, 18, 2)} {out}
                </>
              }
            />
          </Recap>

          <Note learnMore>The merged position shares the unlock schedule of the longest one, from before the merge.</Note>
          <Alerts errors={formState.errors} isLoading={isLoading} />
          <div className="mt-5">
            <FormButtons connect={connect} actions={{ handleApprove: undefined, handleProcess: actionMerge }} formState={formState} labelProcess="Merge" />
          </div>
        </>
      )}
    </div>
  )
}
