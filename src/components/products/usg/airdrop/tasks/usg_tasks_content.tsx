"use client"

import Image from "next/image"
import { useUSGContext } from "../../usg_context"
import { formatNumber } from "@/lib/number_formatter"
import { SlidingTabs } from "./components/SlidingTabs"
import { useUsgTasksContext } from "./usg_tasks_context"
import { useUsgAirdropContext } from "../usg_airdrop_context"
import { Button } from "@/components/design_system/inputs/button"
import { lpListState, LPTasksList } from "./components/LPTasksList"
import { lpListHeaders, voteListHeaders } from "./usg_tasks_controller"
import { voteListState, VoteTasksList } from "./components/VoteTasksList"
import { ListProvider } from "@/components/design_system/list/list_context"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { NeonMetricsCard } from "@/components/design_system/structure/neon_metrics_card"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import PointsCampaignLiveCard from "@/components/design_system/structure/points_campaign_live_card"

export default function UsgTasksContent() {
  const { userBoostFactor } = useUsgAirdropContext()

  const { lpUserPoints, voteUserPoints } = useUSGContext()

  const { isConnected, connect } = useWalletConnexionContext()

  const { lpTasks, voteTasks, selectedFeature, sortLpTasks, sortVoteTasks, setSelectedFeature } = useUsgTasksContext()

  return (
    <>
      <div className="flex w-full items-stretch justify-between gap-6">
        <ReliefCard className="hidden w-1/2 rounded-[10px] bg-panel-title-gradient xl:flex">
          <div className="flex items-center justify-center">
            <Image height={140} width={140} src="/medias/tokens/USG.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          </div>
          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Tasks</span>
            <p className="text-[15px]">
              Borrow USG, provide liquidity, and vote for USG and sUSG pools to earn points. Points will be convertible for TAN tokens once the campaign ends.
            </p>
          </div>
        </ReliefCard>

        <div className="flex h-auto w-full flex-col items-center gap-4 xl:w-1/2">
          <PointsCampaignLiveCard></PointsCampaignLiveCard>

          <div className="flex w-full flex-col items-start justify-between gap-4 md:flex-row">
            <NeonMetricsCard
              title="Vote"
              subtitle="Voting points"
              value={`${formatNumber(voteUserPoints?.voteTotalPoints, 0)} pts`}
              color1="#FA00FF"
              color2="rgba(251, 0, 255, 0.2)"
              className="mt-4 h-full"
            />

            <NeonMetricsCard
              title="Liquidity"
              subtitle="Liquidity points"
              value={`${formatNumber(lpUserPoints?.lpTotalPoints, 0)} pts`}
              extra={`(${formatNumber(lpUserPoints?.lpDailyRate * userBoostFactor, 0)}pts/day)`}
              color1="#95FF00"
              color2="rgba(149, 255, 0, 0.2)"
              className="mt-4 h-full"
            />

            <ReliefCard className="hidden w-fit min-w-32 flex-col items-center justify-center gap-1 self-end rounded-[10px] bg-overlay-panel px-4 py-2 lg:flex">
              <span className="text-center text-sm text-subtitle">Your boost</span>
              <span className="text-center text-xl font-semibold text-white">x{userBoostFactor}</span>
            </ReliefCard>
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
    </>
  )
}
