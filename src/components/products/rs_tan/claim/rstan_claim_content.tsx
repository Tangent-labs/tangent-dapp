"use client"

import { useRsTanContext } from "../rstan_layout_context"
import { LockPosition, LockPositionSelectTemplate } from "../../tg_usd/tg_usd_type"
import { Button } from "@/components/design_system/inputs/button"
import { useRsTanClaimContext } from "./rstan_claim_context"
import { formatBigInt } from "@/lib/number_formatter"
import TokenImage from "@/components/design_system/structure/token_image"
import { ExistingAsset } from "@/types"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import { MultiPositionSelect } from "@/components/design_system/inputs/input_multiselect"

export const RsTanClaimContent = () => {
  const { lockData } = useRsTanContext()

  const { actionClaim, selectedPositions, setSelectedPositions, selectedPositionsData } = useRsTanClaimContext()

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

  return (
    <div className="flex w-full flex-col items-start justify-start">
      <div className="my-1 text-lg font-bold text-white">Select position(s) :</div>

      <MultiPositionSelect
        template={AssetSelectTemplate}
        lockData={lockData}
        selectedPositions={selectedPositions}
        setSelectedPositions={setSelectedPositions}
      />

      <div className="mb-1 mt-4 text-lg font-bold text-white">Claimable :</div>

      <PanelRaw className="flex h-full w-full items-center justify-between gap-2 px-2 py-3">
        <div className="flex flex-col">
          <div className="text-xs font-bold text-subtitle">You receive</div>

          <div className="text-xl">
            <input
              type="number"
              value={formatBigInt(
                selectedPositionsData.reduce((el, acc) => el + acc.claimable, 0n),
                18,
                2
              )}
              placeholder="Amount"
              className="min-h-10 rounded-[10px] border-opacity-20 bg-transparent py-2 font-bold focus:outline-none"
            />
          </div>

          <div className="text-xs text-subtitle">$({12})</div>
        </div>

        <div className="flex h-full flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-1 rounded-[10px] bg-white bg-opacity-[5%] px-3 py-2 font-bold backdrop-blur-[30px]">
            <TokenImage token={"tgUSD" as ExistingAsset} className="" size={32} />
            tgUSD
          </div>
        </div>
      </PanelRaw>

      <div className="mb-1 mt-4 text-lg font-bold text-white">Claim recap :</div>
      <div className="flex w-full flex-col items-center justify-around gap-2 rounded-[10px] border border-white/10 bg-white/10 bg-opacity-[1%] p-3 backdrop-blur-[10px]">
        <div className="flex w-full flex-col items-start justify-start">
          <div className="flex w-full items-start justify-start">
            <div className="flex w-1/2 items-start justify-start">Position ID</div>

            <div className="flex w-1/2 items-start justify-start">tgUSD received</div>
          </div>

          {selectedPositionsData.map((position: LockPosition, index: number) => (
            <div key={index} className="my-1 flex w-full items-center gap-2">
              <div className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-white/10 bg-black bg-opacity-[1%] py-1 backdrop-blur-[10px]">
                #{position.tokenId}
              </div>
              <div className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-white/10 bg-black bg-opacity-[1%] backdrop-blur-[10px]">
                {formatBigInt(position.claimable, 18, 2)}
                <TokenImage token={"tgUSD" as ExistingAsset} className="" size={32} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPositionsData && selectedPositionsData.length > 0 && (
        <Button className="mt-3 flex w-full justify-center" onClick={actionClaim}>
          Claim
        </Button>
      )}
    </div>
  )
}
