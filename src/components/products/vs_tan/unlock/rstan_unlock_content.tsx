"use client"

import { Switch } from "@/components/ui/switch"
import { formatBigInt } from "@/lib/number_formatter"
import { useVsTanContext } from "../rstan_layout_context"
import { useVsTanUnlockContext } from "./rstan_unlock_context"
import { IconOpenOutside, IconVsTan } from "@/components/icons"
import { Button } from "@/components/design_system/inputs/button"
import FormButtons from "@/components/design_system/form/form_actions"
import { FormAlert } from "@/components/design_system/inputs/form_alert"
import { InputSelect } from "@/components/design_system/inputs/input_select"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { LockPositionSelectTemplate } from "../../usg/usg_type"
import { UnlockMode } from "./rstan_unlock_controller"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

const processLabels: Record<UnlockMode, string> = {
  none: "Unlock",
  perma: "Remove perma-lock",
  locked: "Rage quit",
  expired: "Unlock",
  kickable: "Unlock",
}

export const VsTanUnlockContent = () => {
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
  } = useVsTanUnlockContext()

  const AssetSelectTemplate = (option: LockPositionSelectTemplate) => {
    return (
      <>
        {option && option?.tokenId ? (
          <div className="flex w-full cursor-pointer items-center rounded-[10px] hover:bg-white/10">
            <span className="text-md w-full font-semibold text-white">#{option.tokenId}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-md font-semibold text-white"></span>
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
          onChange={(e) => setUnlockPosition(e)}
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
        value={unlockPosition || ""}
        options={selectOptions}
        onChange={(e) => setUnlockPosition(e)}
      />
    )
  }

  return (
    <div className="flex w-full flex-col items-start justify-start">
      <div className="mb-1 text-xl font-semibold text-white">Select position :</div>

      <PositionSelect />

      {mode === "perma" ? (
        <div className="my-3 flex w-full flex-col rounded-[10px] bg-overlay-panel p-3 text-xs text-subtitle">
          <span className="mb-1 font-semibold text-white">This position is perma-locked.</span>
          <span>Removing the perma-lock reverts it to a standard 13-week lock. Once that lock expires, the position can be unlocked without penalty.</span>
        </div>
      ) : (
        <>
          <div className="mb-1 mt-3 text-lg font-semibold text-white">Unlock recap :</div>

          <div className="flex w-full items-center justify-around gap-2 rounded-[10px] p-3 backdrop-blur-[60px]">
            <div className="flex w-full flex-col items-start justify-start">
              <div className="text-[15px] text-subtitle">TAN received</div>

              {unlockPositionInfo && unlockPositionInfo?.amount ? (
                <div className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-overlay-panel py-2 font-semibold text-tonic backdrop-blur-[60px]">
                  {formatBigInt(tanReceived, 18, 2)} <IconVsTan className="h-5 w-5" />
                </div>
              ) : (
                <div className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-overlay-panel py-2 backdrop-blur-[60px]">
                  0 <IconVsTan className="h-5 w-5" />
                </div>
              )}
            </div>

            <div className="flex w-full flex-col items-start justify-start">
              <div className="text-[15px] text-subtitle">TAN forfeited</div>

              {unlockPositionInfo && unlockPositionInfo?.amount ? (
                <div className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-overlay-panel py-2 font-semibold backdrop-blur-[60px]">
                  {formatBigInt(tanForfeited, 18, 2)} <IconVsTan className="h-5 w-5" />
                </div>
              ) : (
                <div className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-overlay-panel py-2 backdrop-blur-[60px]">
                  0 <IconVsTan className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {unlockPositionInfo && mode !== "perma" && (
        <>
          <div className="mb-1 mt-4 flex w-full items-center justify-between font-semibold">
            <div className="my-3 font-semibold text-white">Claim recap:</div>

            <div className="flex items-center justify-center gap-2 text-xs text-subtitle">
              Claim as sUSG
              <Switch checked={claimAsSUSG} onCheckedChange={() => setClaimAsSUSG(!claimAsSUSG)} />
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-around gap-2 rounded-[10px] p-3 backdrop-blur-[10px]">
            <div className="flex w-full flex-col items-start justify-start">
              <div className="flex w-full items-start justify-start">
                <div className="flex w-1/2 items-start justify-start text-[15px] text-subtitle">Position ID</div>

                <div className="flex w-1/2 items-start justify-start text-[15px] text-subtitle"> {claimAsSUSG ? "sUSG" : "USG"} received</div>
              </div>

              <div className="my-1 flex w-full items-center gap-2">
                <div className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-overlay-panel py-1 backdrop-blur-[10px]">
                  #{unlockPositionInfo.tokenId}
                </div>
                <div className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-overlay-panel backdrop-blur-[10px]">
                  {formatBigInt(unlockPositionInfo.claimable, 18, 2)}
                  <TokenImage token={claimAsSUSG ? "sUSG" : "USG"} className="" size={16} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {mode === "locked" && (
        <div className="my-2 flex flex-col rounded-[10px] bg-overlay-panel p-2 text-xs text-subtitle">
          <span>A penalty is applied for early unlocks (prior to the initial unlock schedule).</span>
          <span onClick={() => window.open("https://youtu.be/5Hplx-geZHo?t=5")} className="flex cursor-pointer items-center underline hover:text-white">
            Learn more <IconOpenOutside className="w-3"></IconOpenOutside>
          </span>
        </div>
      )}

      {mode === "kickable" && (
        <div className="my-2 flex w-full rounded-[10px] bg-overlay-panel p-2 text-xs text-subtitle">
          This position is past the kick delay — anyone can kick it and collect a bounty on your TAN. Unlock it to withdraw in full.
        </div>
      )}

      {formState.errors
        .filter((error) => error.type === "form-alert")
        .map((error) => (
          <FormAlert key={error.key} error={error} className="my-1" isLoading={isLoading} />
        ))}

      <FormButtons
        formState={formState}
        actions={{ handleProcess: actionProcess }}
        labelProcess={processLabels[mode]}
        connect={connect}
        isLoading={isLoading}
      />

      {kickablePositions.length > 0 && kickParams && (
        <>
          <div className="mb-1 mt-4 text-lg font-semibold text-white">Kickable positions :</div>

          <div className="mb-2 flex w-full rounded-[10px] bg-overlay-panel p-2 text-xs text-subtitle">
            These positions passed the kick delay. Kick them to withdraw the owner&apos;s TAN and collect a {Number(kickParams.percentage) / 1000}% bounty.
          </div>

          <div className="flex w-full flex-col gap-2">
            {kickablePositions.map(({ position, bounty }) => (
              <div
                key={position.tokenId.toString()}
                className="flex w-full items-center justify-between gap-2 rounded-[10px] bg-overlay-panel px-3 py-2 backdrop-blur-[60px]"
              >
                <div className="flex items-center font-semibold">#{position.tokenId.toString()}</div>

                <div className="flex items-center gap-1 font-semibold">
                  {formatBigInt(position.amount, 18, 2)} <IconVsTan className="h-5 w-5" />
                </div>

                <div className="flex items-center gap-1 text-subtitle">
                  Bounty {formatBigInt(bounty, 18, 4)} <IconVsTan className="h-4 w-4" />
                </div>

                <Button disabled={isLoading} onClick={() => actionKick(position.tokenId)}>
                  Kick
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
