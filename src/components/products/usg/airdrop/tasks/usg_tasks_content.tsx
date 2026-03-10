"use client"

import Image from "next/image"
import { useUSGContext } from "../../usg_context"
import { SlidingTabs } from "./components/SlidingTabs"
import { useUsgTasksContext } from "./usg_tasks_context"
import { useUsgAirdropContext } from "../usg_airdrop_context"
import { Button } from "@/components/design_system/inputs/button"
import { lpListState, LPTasksList } from "./components/LPTasksList"
import { lpListHeaders, voteListHeaders } from "./usg_tasks_controller"
import { voteListState, VoteTasksList } from "./components/VoteTasksList"
import { ListProvider } from "@/components/design_system/list/list_context"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { AirdropSharedHeader } from "../components/airdrop_side_header"
import { InputSearch } from "@/components/design_system/inputs/input_search"
import { LargeButtonTab } from "@/components/design_system/inputs/large_button_tab"
import { InputSelect } from "@/components/design_system/inputs/input_select"
import { protocolOptions } from "../../list/usg_market_controller"

export default function UsgTasksContent() {
  const { lpUserPoints, voteUserPoints } = useUSGContext()

  const { isConnected, connect } = useWalletConnexionContext()

  const {
    lpTasks,
    protocol,
    voteTasks,
    filteredBy,
    searchValue,
    selectedFeature,
    sortLpTasks,
    setProtocol,
    sortVoteTasks,
    setFilteredBy,
    setSearchValue,
    setSelectedFeature,
  } = useUsgTasksContext()

  const { userBoostFactor, setReferralStatus, referralStatus, airdropDataIsLoading, signMessage } = useUsgAirdropContext()

  return (
    <>
      <div className="flex w-full items-stretch justify-between gap-6">
        <ReliefCard className="hidden w-1/2 bg-panel-title-gradient xl:flex">
          <div className="flex items-center justify-center">
            <Image height={140} width={140} src="/medias/logos/tasks.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          </div>
          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Tasks</span>
            <p className="text-[15px]">
              Borrow USG, provide liquidity, and vote for USG and sUSG pools to earn points. Points will be convertible for TAN tokens once the campaign ends.
            </p>
          </div>
        </ReliefCard>

        <AirdropSharedHeader
          isConnected={isConnected}
          setReferralStatus={setReferralStatus}
          referralStatus={referralStatus}
          signMessage={signMessage}
          airdropDataIsLoading={airdropDataIsLoading}
          lpUserPoints={lpUserPoints}
          userBoostFactor={userBoostFactor}
          voteUserPoints={voteUserPoints}
        />
      </div>

      <div className="my-2 w-full">
        <SlidingTabs labels={["Borrow & LP", "Vote"]} value={selectedFeature} onSwitchTab={(e: string) => setSelectedFeature(e)} />
      </div>

      <div className="hidden items-end justify-between xl:flex">
        <div className="flex flex-col items-stretch justify-between gap-3">
          <div className="flex w-full items-end justify-start gap-2">
            <div className="flex w-full min-w-96 flex-col items-center justify-center">
              <div className="mb-1 text-xs text-subtitle"> Search </div>
              <InputSearch
                placeholder=""
                className="flex w-full flex-col items-center justify-center"
                value={searchValue ?? ""}
                onChange={(e) => setSearchValue(e as string)}
              />
            </div>

            <LargeButtonTab
              onClick={() => setFilteredBy("all")}
              className="h-10 px-4"
              active={!filteredBy || filteredBy === "all"}
              label="All"
            ></LargeButtonTab>
            <LargeButtonTab
              onClick={() => setFilteredBy("deposits")}
              className="h-10 px-4"
              active={filteredBy === "deposits"}
              label="Deposits"
            ></LargeButtonTab>
          </div>
        </div>
        <div className="flex flex-col items-stretch justify-end gap-3">
          <div className="flex w-full flex-col items-center justify-center md:w-fit">
            <div className="mb-1 text-xs text-subtitle"> Protocol </div>

            <InputSelect className="w-full min-w-48" value={protocol || ""} options={protocolOptions} onChange={(e) => setProtocol(e)} />
          </div>
        </div>
      </div>

      <div className="flex w-full items-start justify-start gap-4">
        <div className="flex w-full flex-col">
          {isConnected && selectedFeature === "Borrow & LP" && (
            <ListProvider customSort={sortLpTasks} _headers={lpListHeaders} _rows={lpTasks} _listState={lpListState}>
              <LPTasksList />
            </ListProvider>
          )}

          {isConnected && selectedFeature === "Vote" && (
            <ListProvider customSort={sortVoteTasks} _headers={voteListHeaders} _rows={voteTasks} _listState={voteListState}>
              <VoteTasksList />
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
