"use client"

import Image from "next/image"
import { SlidingTabs } from "./components/SlidingTabs"
import { useUSGContext } from "../../tg_usd_context"
import { formatNumber } from "@/lib/number_formatter"
import { lpListState, LPTasksList } from "./components/LPTasksList"
import { voteListState, VoteTasksList } from "./components/VoteTasksList"
import { ListProvider } from "@/components/design_system/list/list_context"
import { useUsgTasksContext } from "./usg_tasks_context"
import { lpListHeaders, voteListHeaders } from "./usg_tasks_controller"

export default function UsgTasksContent() {
  const { lpTasks, voteTasks, selectedFeature, sortLpTasks, sortVoteTasks, setSelectedFeature } = useUsgTasksContext()

  const { lpUserPoints, voteUserPoints } = useUSGContext()

  return (
    <div className="flex w-full flex-col items-center justify-between">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="usg-header hidden w-1/2 lg:flex">
          <div className="flex items-center justify-center">
            <Image height={320} width={320} className="an-logo" src="/medias/product_tgusd.png" alt="token" />
          </div>
          <div className="flex flex-col items-start justify-center gap-3">
            <span className="text-[48px] font-semibold">Tasks</span>
            <p>
              Borrow USG, provide liquidity, and vote for USG and sUSG pools to earn points. Points will be convertible for TAN tokens once the campaign ends.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch justify-between gap-6 lg:w-1/2">
          <div className="flex h-full w-full flex-col items-start justify-start gap-8 rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
            <div className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/pointsCampaign.png')] bg-[position:calc(100%+40px)_center] bg-no-repeat px-6 !text-xl !font-semibold italic">
              Points campaign
              <div className="ml-2 flex items-center justify-center rounded-[10px] bg-tonic px-2 py-0.5 !font-semibold !not-italic !text-black">Live</div>
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
            <div className="relative flex w-full min-w-56 flex-col items-center justify-center rounded-[10px] bg-overlay-panel px-8 py-3 backdrop-blur-[60px]">
              <div className="absolute -top-2 left-0 flex w-full">
                <div className="mx-4 flex w-full items-center justify-between rounded-full pl-3">
                  <div className="text-xs italic">Boost x1.1</div>
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
                <div className="mx-4 flex w-full items-center justify-between rounded-full pl-3">
                  <div className="text-xs italic">Boost x1.5</div>
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
        <SlidingTabs labels={["Borrow & LP", "Vote"]} value={selectedFeature} onChange={(e: "Borrow & LP" | "Vote") => setSelectedFeature(e)} />
      </div>

      <div className="flex w-full items-start justify-start gap-4">
        <div className="flex w-full flex-col">
          {selectedFeature === "Borrow & LP" && (
            <ListProvider customSort={sortLpTasks} _headers={lpListHeaders} _rows={lpTasks} _listState={lpListState}>
              <LPTasksList></LPTasksList>
            </ListProvider>
          )}

          {selectedFeature === "Vote" && (
            <ListProvider customSort={sortVoteTasks} _headers={voteListHeaders} _rows={voteTasks} _listState={voteListState}>
              <VoteTasksList></VoteTasksList>
            </ListProvider>
          )}
        </div>
      </div>
    </div>
  )
}
