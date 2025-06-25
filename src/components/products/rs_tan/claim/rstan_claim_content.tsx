"use client"

import { useRsTanContext } from "../rstan_layout_context"
import { LockPosition, LockPositionSelectTemplate } from "../../tg_usd/tg_usd_type"
import { Button } from "@/components/design_system/inputs/button"
import { useRsTanClaimContext } from "./rstan_claim_context"
import { formatBigInt } from "@/lib/number_formatter"
import TokenImage from "@/components/design_system/structure/token_image"
import { MultiPositionSelect } from "@/components/design_system/inputs/input_multiselect"
import { Switch } from "@/components/ui/switch"

export const RsTanClaimContent = () => {
  const { lockData } = useRsTanContext()

  const { claimAsSgUSD, selectedPositions, hasDuplicates, selectedPositionsData, actionClaim, setClaimAsSgUSD, setSelectedPositions } = useRsTanClaimContext()

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
      <div className="mb-1 text-lg font-semibold text-white">Select position(s) :</div>

      <MultiPositionSelect
        template={AssetSelectTemplate}
        lockData={lockData}
        selectedPositions={selectedPositions}
        setSelectedPositions={setSelectedPositions}
      />

      <div className="mb-1 mt-4 flex w-full items-center justify-between font-semibold">
        <div className="text-lg text-white">Claimable :</div>

        <div className="flex items-center justify-center gap-2 text-xs text-subtitle">
          Claim as sgUSD <Switch checked={claimAsSgUSD} onCheckedChange={() => setClaimAsSgUSD(!claimAsSgUSD)} />
        </div>
      </div>

      <div className="flex h-full w-full items-center justify-between gap-2 rounded-[10px] px-2 py-3 backdrop-blur-[60px]">
        <div className="flex flex-col">
          <div className="text-xs font-semibold text-subtitle">You receive</div>

          <div className="text-xl">
            <input
              type="string"
              disabled={true}
              value={formatBigInt(
                selectedPositionsData.reduce((el, acc) => el + acc.claimable, 0n),
                18,
                2
              )}
              placeholder="Amount"
              className="min-h-10 rounded-[10px] border-opacity-20 bg-transparent py-2 font-semibold focus:outline-none"
            />
          </div>

          <div className="text-xs text-subtitle">$({12})</div>
        </div>

        <div className="flex h-full flex-col items-center justify-center">
          <div className="flex items-center justify-center rounded-[10px] bg-overlay-panel px-3 py-2 font-semibold backdrop-blur-[60px]">
            <TokenImage token={claimAsSgUSD ? "sgUSD" : "tgUSD"} className="mr-2" size={16} />
            {claimAsSgUSD ? "sgUSD" : "tgUSD"}
          </div>
        </div>
      </div>

      <div className="mb-1 mt-4 text-lg font-semibold text-white">Claim recap :</div>
      <div className="flex w-full flex-col items-center justify-around gap-2 rounded-[10px] p-3 backdrop-blur-[10px]">
        <div className="flex w-full flex-col items-start justify-start">
          <div className="flex w-full items-start justify-start">
            <div className="flex w-1/2 items-start justify-start text-subtitle">Position ID</div>

            <div className="flex w-1/2 items-start justify-start text-subtitle"> {claimAsSgUSD ? "sgUSD" : "tgUSD"} received</div>
          </div>

          {selectedPositionsData.map((position: LockPosition, index: number) => (
            <div key={index} className="my-1 flex w-full items-center gap-2">
              <div className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-overlay-panel py-1 backdrop-blur-[10px]">
                #{position.tokenId}
              </div>
              <div className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-overlay-panel backdrop-blur-[10px]">
                {formatBigInt(position.claimable, 18, 2)}
                <TokenImage token={claimAsSgUSD ? "sgUSD" : "tgUSD"} className="" size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPositionsData && selectedPositionsData.length > 0 && (
        <Button state={hasDuplicates ? "disabled" : "active"} className="mt-3 flex w-full justify-center" onClick={actionClaim}>
          Claim
        </Button>
      )}
    </div>
  )
}
