"use client"

import Image from "next/image"
import { UserTask } from "../tg_usd_type"
import { ExistingAsset, ListState } from "@/types"
import { useUSGContext } from "../tg_usd_context"
import { formatNumber } from "@/lib/number_formatter"
import { airdropListHeaders } from "./tg_usd_airdrop_controller"
import { useTgUsdAirdropContext } from "./tg_usd_airdrop_context"
import { IconSortHeader } from "@/components/icons/icon_sort_header"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "market",
    direction: "asc",
  },
}

const TaskStatus = ({ status }: { status: boolean }) => {
  if (status) {
    return <div className="h-2 w-2 rounded-full bg-light-tonic outline outline-1 outline-offset-4 outline-light-tonic"></div>
  }
  return <div className="h-2 w-2 rounded-full bg-subtitle"></div>
}

const AirdropRowDisposition = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="flex w-full items-center justify-evenly px-2">
      <div className="flex w-3/12 items-center justify-center">{children?.at(0)} </div>
      <div className="hidden w-2/12 items-center justify-center lg:flex">{children?.at(1)} </div>
      <div className="flex w-4/12 items-center justify-center lg:w-3/12">{children?.at(2)} </div>
      <div className="flex w-1/12 items-center justify-center">{children?.at(3)} </div>
      <div className="flex w-1/12 items-center justify-center">{children?.at(4)} </div>
      <div className="flex w-2/12 items-center justify-center">{children?.at(5)} </div>
    </div>
  )
}

export default function TgUsdAidropContent() {
  const { displayRows, customSort } = useTgUsdAirdropContext()

  const { userPoints } = useUSGContext()

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
            <div className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/pointsCampaign.png')] bg-[position:calc(100%+40px)_center] bg-no-repeat px-6 !text-[20px] !font-semibold italic">
              Points campaign
              <div className="ml-2 flex items-center justify-center rounded-[10px] bg-tonic px-2 py-0.5 !font-semibold !not-italic !text-black">Live</div>
            </div>
          </div>

          <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
            <div className="relative flex w-full min-w-56 flex-col items-center justify-center rounded-[10px] bg-overlay-panel px-8 py-3 backdrop-blur-[60px]">
              <div className="absolute -top-2 left-0 flex w-full">
                <div className="mx-4 flex w-full items-center justify-between rounded-full bg-[#070707] px-4">
                  <div className="text-xs italic">Boost x1.1</div>
                  <div className="rounded-full bg-tonic px-6 text-xs font-semibold text-black">Vote</div>
                </div>
              </div>

              <span className="text-[14px] text-subtitle">Voting points</span>
              <div className="flex items-center justify-center gap-1">
                <span className="text-sm font-semibold text-white">1385 pts</span>
                <span className="text-xs text-tonic">(30pts/day)</span>
              </div>
            </div>

            <div className="relative flex w-full min-w-56 flex-col items-center justify-center rounded-[10px] bg-overlay-panel px-8 py-3 backdrop-blur-[60px]">
              <div className="absolute -top-2 left-0 flex w-full">
                <div className="mx-4 flex w-full items-center justify-between rounded-full bg-[#070707] px-4">
                  <div className="text-xs italic">Boost x1.5</div>
                  <div className="rounded-full bg-pink px-6 text-xs font-semibold text-black">Liquidity</div>
                </div>
              </div>

              <span className="text-[14px] text-subtitle">Liquidity points</span>
              <div className="flex items-center justify-center gap-1">
                <span className="text-sm font-semibold text-white">{formatNumber(userPoints?.totalPoints, 0)} pts</span>
                <span className="text-xs text-tonic">({formatNumber(userPoints?.dailyRate, 0)}pts/day)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-start justify-start gap-4">
        <div className="flex w-full flex-col">
          <ListProvider customSort={customSort} _headers={airdropListHeaders} _rows={displayRows} _listState={listeState}>
            <AirdropList></AirdropList>
          </ListProvider>
        </div>
      </div>
    </div>
  )
}

const computeProtocolDisplay = (protocol: string) => {
  switch (protocol.toLowerCase()) {
    case "tangent":
      return (
        <div className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-1 text-[14px] backdrop-blur-[60px]">
          <TokenImage token={"USG"} size={16} />
          <span>Tangent</span>
        </div>
      )

    case "convex":
      return (
        <div className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-1 text-[14px] backdrop-blur-[60px]">
          <TokenImage token={"CVX"} size={16} />
          <span>Convex</span>
        </div>
      )
    case "curve":
      return (
        <div className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-1 text-[14px] backdrop-blur-[60px]">
          <TokenImage token={"CRV"} size={16} />
          <span>Curve</span>
        </div>
      )
    case "stakedao":
      return (
        <div className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-1 text-[14px] backdrop-blur-[60px]">
          <TokenImage token={"SDT"} size={16} />
          <span>Stake DAO</span>
        </div>
      )
  }
}

function AirdropList() {
  const { headers, listState, udpateSort, displayRows } = useListContext()

  return (
    <>
      <div className="mb-1 mt-6 rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <div className={`hidden p-4 leading-[10px] xl:block`}>
          <AirdropRowDisposition>
            {!!headers?.at(0)?.key && (
              <div className="flex w-full">
                <span>{headers?.at(0)?.label}</span>
              </div>
            )}
            {!!headers?.at(1)?.key && (
              <div className="flex w-full items-center justify-center">
                <span>{headers?.at(1)?.label}</span>
              </div>
            )}

            {!!headers?.at(2)?.key && (
              <div className="flex w-full items-center justify-center">
                <span>{headers?.at(2)?.label}</span>
              </div>
            )}
            {!!headers?.at(3)?.key && (
              <div key={headers?.at(3)?.label} className="flex w-full items-center justify-center">
                <button className="flex w-full justify-center gap-2" type="button" onClick={() => udpateSort && udpateSort(String(headers?.at(3)?.key))}>
                  <span>{headers?.at(3)?.label} </span>
                  <div className="text-row-tonic">
                    <IconSortHeader sort={(listState?.sort?.key === headers?.at(3)?.key && listState?.sort?.direction) || "none"} />
                  </div>
                </button>
              </div>
            )}
            {!!headers?.at(4)?.key && (
              <div key={headers?.at(4)?.label} className="flex w-full items-center justify-center">
                <button className="flex w-full justify-center gap-2" type="button" onClick={() => udpateSort && udpateSort(String(headers?.at(4)?.key))}>
                  <span>{headers?.at(4)?.label} </span>
                  <div className="text-row-tonic">
                    <IconSortHeader sort={(listState?.sort?.key === headers?.at(4)?.key && listState?.sort?.direction) || "none"} />
                  </div>
                </button>
              </div>
            )}
            {!!headers?.at(5)?.key && (
              <div key={headers?.at(5)?.label} className="flex w-full items-center justify-center">
                <button className="flex w-full justify-center gap-2" type="button" onClick={() => udpateSort && udpateSort(String(headers?.at(5)?.key))}>
                  <span>{headers?.at(5)?.label} </span>
                  <div className="text-row-tonic">
                    <IconSortHeader sort={(listState?.sort?.key === headers?.at(5)?.key && listState?.sort?.direction) || "none"} />
                  </div>
                </button>
              </div>
            )}
          </AirdropRowDisposition>
        </div>
      </div>

      <div className="scrollbar-thin scrollbar-thumb-white scrollbar-track-transparent max-h-[500px] overflow-y-auto">
        {displayRows &&
          (displayRows as UserTask[])?.map((task: UserTask) => (
            <BorderPanel
              key={task?.taskId}
              className="mb-2 bg-overlay-panel px-5 py-3 backdrop-blur-[60px] before:absolute before:inset-0 before:-z-10 before:rounded-[10px] before:opacity-70 hover:cursor-pointer hover:before:bg-list-row-hover"
            >
              <div className="hidden items-center justify-between md:flex">
                <div className="flex w-3/12 items-center gap-2 xl:gap-4">
                  <TokenImage token={task.asset as ExistingAsset} size={48} />

                  <span className="flex text-[20px] font-semibold">{task.asset}</span>
                </div>
                <div className="hidden w-2/12 justify-center lg:flex">
                  <div onClick={() => window.open(task?.url, "_blank", "noopener,noreferrer")}>{computeProtocolDisplay(task?.protocol)}</div>
                </div>
                <div className="flex w-4/12 justify-center lg:w-3/12">
                  <div
                    className="flex items-center justify-center rounded-[10px] bg-overlay-panel px-6 py-2 text-center text-xs backdrop-blur-[60px]"
                    onClick={() => window.open(task?.url, "_blank", "noopener,noreferrer")}
                  >
                    {task?.description}
                  </div>
                </div>
                <div className="flex w-1/12 items-center justify-center">{(task?.pointRate * 86400).toFixed(0)}</div>
                <div className="flex w-1/12 items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-white/10 backdrop-blur-lg">
                    <TaskStatus status={task?.status} />
                  </div>
                </div>
                <div className="flex w-2/12 items-center justify-center">{formatNumber(task?.points, 0)}</div>
              </div>

              <div className="flex flex-col items-center justify-between md:hidden">
                <div className="flex w-full items-start justify-between gap-1 border-b border-white border-opacity-20 pb-2">
                  <div className="flex items-center justify-center gap-2">
                    <TokenImage token={task.asset as ExistingAsset} size={48} />

                    <span className="flex text-[14px] font-semibold">{task.asset}</span>
                  </div>

                  <div className="flex flex-col items-center justify-start">
                    <span className="text-xs text-subtitle">Pts/Day/USD</span>

                    <span className="flex text-[14px]">{(task.pointRate * 86400).toFixed(0)}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs text-subtitle">Protocol</span>

                    <span className="flex text-[14px]">{computeProtocolDisplay(task?.protocol)}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs text-subtitle">Points</span>

                    <span className="flex text-[14px]">{task.points}</span>
                  </div>
                </div>
                <div className="flex w-full items-center justify-center"> {task?.description}</div>
              </div>
            </BorderPanel>
          ))}
      </div>
    </>
  )
}
