"use client"

import Image from "next/image"
import { useUSGContext } from "../../tg_usd_context"
import { formatNumber } from "@/lib/number_formatter"
import { SlidingTabs } from "./components/SlidingTabs"
import { useUsgTasksContext } from "./usg_tasks_context"
import { Button } from "@/components/design_system/inputs/button"
import { lpListState, LPTasksList } from "./components/LPTasksList"
import { lpListHeaders, voteListHeaders } from "./usg_tasks_controller"
import { voteListState, VoteTasksList } from "./components/VoteTasksList"
import { ListProvider } from "@/components/design_system/list/list_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

export default function UsgTasksContent() {
  const { isConnected, connect } = useWalletConnexionContext()

  const { lpTasks, voteTasks, selectedFeature, sortLpTasks, sortVoteTasks, setSelectedFeature } = useUsgTasksContext()

  const { lpUserPoints, voteUserPoints } = useUSGContext()

  return (
    <div className="flex w-full flex-col items-center justify-between">
      <div className="flex w-full items-stretch justify-between gap-6">
        <div className="hidden w-1/2 rounded-[10px] bg-panel-title-gradient xl:flex">
          <div className="flex items-center justify-center">
            <Image height={140} width={140} src="/medias/tokens/USG.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          </div>
          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Tasks</span>
            <p className="text-[15px]">
              Borrow USG, provide liquidity, and vote for USG and sUSG pools to earn points. Points will be convertible for TAN tokens once the campaign ends.
            </p>
          </div>
        </div>

        <div className="flex h-auto w-full flex-col items-center gap-3 xl:w-1/2">
          <div className="flex h-full w-full flex-col items-start justify-start gap-8 rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
            <div
              style={{ fontSize: "20px", lineHeight: "20px" }}
              className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/pointsCampaign.png')] bg-[position:calc(100%+40px)_center] bg-no-repeat px-6 !font-semibold italic"
            >
              Points campaign
              <div className="ml-6 flex items-center justify-center rounded-[10px] bg-tonic px-6 py-0.5 font-semibold not-italic text-black">Live</div>
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
            <div className="relative flex w-full min-w-56 flex-col items-center justify-center rounded-[10px] bg-overlay-panel px-8 py-3 backdrop-blur-[60px]">
              <div className="absolute -top-2 left-0 flex w-full">
                <div className="mx-4 flex w-full items-center justify-end rounded-full pl-3">
                  <div className="rounded-full bg-tonic px-6 text-xs font-semibold text-black">Vote</div>
                </div>
              </div>

              <span className="text-sm text-subtitle">Voting points</span>
              <div className="flex items-center justify-center gap-1">
                <span className="text-sm font-semibold text-white">{formatNumber(voteUserPoints?.voteTotalPoints, 0)} pts</span>
              </div>
            </div>

            <div className="relative flex w-full min-w-56 flex-col items-center justify-center rounded-[10px] bg-overlay-panel px-8 py-3 backdrop-blur-[60px]">
              <div className="absolute -top-2 left-0 flex w-full">
                <div className="mx-4 flex w-full items-center justify-end rounded-full pl-3">
                  <div className="rounded-full bg-pink px-6 text-xs font-semibold text-black">Liquidity</div>
                </div>
              </div>

              <span className="text-sm text-subtitle">Liquidity points</span>
              <div className="flex items-center justify-center gap-1">
                <span className="text-sm font-semibold text-white">{formatNumber(lpUserPoints?.lpTotalPoints, 0)} pts</span>
                <span className="text-xs text-tonic">({formatNumber(lpUserPoints?.lpDailyRate, 0)}pts/day)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="my-2 w-full">
        <SlidingTabs labels={["Borrow & LP", "Vote"]} value={selectedFeature} onSwitchTab={(e: string) => setSelectedFeature(e)} />
      </div>

      <div className="flex w-full items-start justify-start gap-4">
        <div className="flex w-full flex-col">
          {isConnected && selectedFeature === "Borrow & LP" && (
            <ListProvider customSort={sortLpTasks} _headers={lpListHeaders} _rows={lpTasks} _listState={lpListState}>
              <LPTasksList></LPTasksList>
            </ListProvider>
          )}

          {isConnected && selectedFeature === "Vote" && (
            <ListProvider customSort={sortVoteTasks} _headers={voteListHeaders} _rows={voteTasks} _listState={voteListState}>
              <VoteTasksList></VoteTasksList>
            </ListProvider>
          )}

          {!isConnected && (
            <div className="mt-12 flex min-h-28 w-full flex-col items-center justify-center gap-4">
              <div className="test-sm flex w-full items-center justify-center text-subtitle">Connect your wallet to see you current tasks</div>
              <div className="flex w-56 flex-col items-center justify-center">
                <Button label="Connect wallet" className="flex w-full items-center justify-center" onClick={connect} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
