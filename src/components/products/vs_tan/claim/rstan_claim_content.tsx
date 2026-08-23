"use client"

import { useVsTanContext } from "../rstan_layout_context"
import { LockPosition, LockPositionSelectTemplate } from "../../usg/usg_type"
import { useVsTanClaimContext } from "./rstan_claim_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { FormAlert } from "@/components/design_system/inputs/form_alert"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { formatBigInt } from "@/lib/number_formatter"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { MultiPositionSelect } from "@/components/design_system/inputs/input_multiselect"
import { Switch } from "@/components/ui/switch"
import { BorderPanel } from "@/components/design_system/structure/border_panel"

export const VsTanClaimContent = () => {
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

  const AssetSelectTemplate = (option: LockPositionSelectTemplate) => {
    return (
      <>
        {option && option?.tokenId ? (
          <div className="flex items-center gap-2">
            <span className="text-md font-semibold text-white">#{option.tokenId}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-md font-semibold text-white"></span>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="flex w-full flex-col items-start justify-start">
      <div className="mb-1 text-xl font-semibold text-white">Select position(s) :</div>

      <MultiPositionSelect
        template={AssetSelectTemplate}
        lockData={lockData}
        selectedPositions={selectedPositions}
        setSelectedPositions={setSelectedPositions}
      />

      <div className="mb-1 mt-4 flex w-full items-center justify-between font-semibold">
        <div className="text-lg text-white">Claimable :</div>

        <div className="flex items-center justify-center gap-2 text-xs text-subtitle">
          Claim as sUSG <Switch checked={claimAsSUSG} onCheckedChange={() => setClaimAsSUSG(!claimAsSUSG)} />
        </div>
      </div>

      <div className="flex h-full w-full items-center justify-between gap-2 rounded-[10px] px-2 py-3 backdrop-blur-[60px]">
        <div className="flex flex-col">
          <div className="text-xs font-semibold text-subtitle">You receive</div>

          <div className="text-xl">
            <input
              type="string"
              disabled={true}
              value={formatBigInt(receivedTotal, 18, 2)}
              placeholder="Amount"
              className="min-h-10 rounded-[10px] border-opacity-10 bg-transparent py-2 font-semibold focus:outline-none"
            />
          </div>

          <div className="text-xs text-subtitle">{claimableDollarValue}</div>
        </div>

        <div className="flex h-full flex-col items-center justify-center">
          <BorderPanel className="flex h-10 items-center gap-2 bg-select-input px-2.5 py-2">
            <TokenImage token={claimAsSUSG ? "sUSG" : "USG"} size={20} />

            <span className="flex flex-col text-sm font-semibold">{claimAsSUSG ? "sUSG" : "USG"}</span>
          </BorderPanel>
        </div>
      </div>

      <div className="mb-1 mt-4 text-lg font-semibold text-white">Claim recap :</div>
      <div className="flex w-full flex-col items-center justify-around gap-2 rounded-[10px] p-3 backdrop-blur-[10px]">
        <div className="flex w-full flex-col items-start justify-start">
          <div className="flex w-full items-start justify-start">
            <div className="flex w-1/2 items-start justify-start text-[15px] text-subtitle">Position ID</div>

            <div className="flex w-1/2 items-start justify-start text-[15px] text-subtitle"> {claimAsSUSG ? "sUSG" : "USG"} received</div>
          </div>

          {selectedPositionsData.map((position: LockPosition, index: number) => (
            <div key={index} className="my-1 flex w-full items-center gap-2">
              <div className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-overlay-panel py-1 backdrop-blur-[10px]">
                #{position.tokenId}
              </div>
              <div className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-overlay-panel backdrop-blur-[10px]">
                {formatBigInt(receivedFor(position), 18, 2)}
                <TokenImage token={claimAsSUSG ? "sUSG" : "USG"} className="" size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="my-2 flex w-full flex-col rounded-[10px] bg-overlay-panel p-2 text-xs text-subtitle">
        <span>Rewards can be claimed separately, or all together.</span>
      </div>

      {formState.errors
        .filter((e) => e.type === "form-alert")
        .map((error) => (
          <FormAlert key={error.key} error={error} className="my-1" isLoading={isLoading} />
        ))}

      <div className="mt-3 flex w-full justify-center">
        <FormButtons actions={{ handleProcess: actionClaim }} connect={connect} formState={formState} isLoading={isLoading} labelProcess="Claim" />
      </div>
    </div>
  )
}
