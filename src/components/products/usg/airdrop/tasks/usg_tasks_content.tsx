"use client"

import Image from "next/image"
import { useUSGContext } from "../../usg_context"
import { SlidingTabs } from "./components/SlidingTabs"
import { useUsgTasksContext } from "./usg_tasks_context"
import { useUsgAirdropContext } from "../usg_airdrop_context"
import { protocolOptions } from "../../list/usg_market_controller"
import { lpListState, LPTasksList } from "./components/LPTasksList"
import { lpListHeaders, voteListHeaders } from "./usg_tasks_controller"
import { AirdropSharedHeader } from "../components/airdrop_side_header"
import { voteListState, VoteTasksList } from "./components/VoteTasksList"
import { ListProvider } from "@/components/design_system/list/list_context"
import { InputSearch } from "@/components/design_system/inputs/input_search"
import { InputSelect } from "@/components/design_system/inputs/input_select"
import { PageHeader } from "@/components/design_system/structure/page_header"
import { LargeButtonTab } from "@/components/design_system/inputs/large_button_tab"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

export default function UsgTasksContent() {
  const { lpUserPoints, voteUserPoints, userBoostFactor } = useUSGContext()

  const { isConnected } = useWalletConnexionContext()

  const {
    lpTasks,
    lpTaskProtocol,
    voteTaskProtocol,
    voteTasks,
    lpTaskSearchValue,
    lpTaskFilteredBy,
    selectedFeature,
    voteTaskSearchValue,
    sortLpTasks,
    setLpTaskProtocol,
    setVoteTaskProtocol,
    sortVoteTasks,
    setLpTaskFilteredBy,
    setLpTaskSearchValue,
    setSelectedFeature,
    setVoteTaskSearchValue,
  } = useUsgTasksContext()

  const { setReferralStatus, referralStatus, airdropDataIsLoading, signMessage } = useUsgAirdropContext()

  return (
    <>
      <div className="flex w-full items-stretch justify-between gap-6">
        <PageHeader>
          <Image height={140} width={140} src="/medias/logos/tasks.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />

          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Tasks</span>
            <p className="text-[15px]">
              Borrow USG, provide liquidity, and vote for USG and sUSG pools to earn points. Points will be convertible for TAN tokens once the campaign ends.
            </p>
          </div>
        </PageHeader>

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

      <div className="flex w-full items-start justify-start gap-4">
        <div className="flex w-full flex-col">
          {selectedFeature === "Borrow & LP" && (
            <>
              <div className="mb-2 hidden items-end justify-between lg:flex xl:mb-0">
                <div className="flex flex-col items-stretch justify-between gap-3">
                  <div className="flex w-full items-end justify-start gap-2">
                    <div className="flex w-full min-w-96 flex-col items-center justify-center">
                      <div className="mb-1 text-xs text-subtitle"> Search </div>
                      <InputSearch
                        placeholder=""
                        className="flex w-full flex-col items-center justify-center"
                        value={lpTaskSearchValue ?? ""}
                        onChange={(e) => setLpTaskSearchValue(e as string)}
                      />
                    </div>

                    <LargeButtonTab
                      onClick={() => setLpTaskFilteredBy("All")}
                      className="h-10 px-4"
                      active={!lpTaskFilteredBy || lpTaskFilteredBy === "All"}
                      label="All"
                    ></LargeButtonTab>
                    <LargeButtonTab
                      onClick={() => setLpTaskFilteredBy("deposits")}
                      className="h-10 px-4"
                      active={lpTaskFilteredBy === "deposits"}
                      label="Deposits"
                    ></LargeButtonTab>
                  </div>
                </div>
                <div className="flex flex-col items-stretch justify-end gap-3">
                  <div className="flex w-full flex-col items-center justify-center md:w-fit">
                    <div className="mb-1 text-xs text-subtitle"> Protocol </div>

                    <InputSelect className="w-full min-w-48" value={lpTaskProtocol || ""} options={protocolOptions} onChange={(e) => setLpTaskProtocol(e)} />
                  </div>
                </div>
              </div>
              <ListProvider customSort={sortLpTasks} _headers={lpListHeaders} _rows={lpTasks} _listState={lpListState}>
                <LPTasksList />
              </ListProvider>
            </>
          )}

          {selectedFeature === "Vote" && (
            <>
              <div className="mb-2 hidden items-end justify-between lg:flex xl:mb-0">
                <div className="flex w-full items-end justify-start gap-2">
                  <div className="flex w-full max-w-96 flex-col items-center justify-center">
                    <div className="mb-1 text-xs text-subtitle"> Search </div>
                    <InputSearch
                      placeholder=""
                      className="flex w-full flex-col items-center justify-center"
                      value={voteTaskSearchValue ?? ""}
                      onChange={(e) => setVoteTaskSearchValue(e as string)}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-stretch justify-end gap-3">
                  <div className="flex w-full flex-col items-center justify-center md:w-fit">
                    <div className="mb-1 text-xs text-subtitle"> Protocol </div>

                    <InputSelect
                      className="w-full min-w-48"
                      value={voteTaskProtocol || ""}
                      options={protocolOptions}
                      onChange={(e) => setVoteTaskProtocol(e)}
                    />
                  </div>
                </div>
              </div>

              <ListProvider customSort={sortVoteTasks} _headers={voteListHeaders} _rows={voteTasks} _listState={voteListState}>
                <VoteTasksList />
              </ListProvider>
            </>
          )}
        </div>
      </div>
    </>
  )
}
