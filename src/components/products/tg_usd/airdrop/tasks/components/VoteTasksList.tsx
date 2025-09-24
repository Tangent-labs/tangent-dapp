"use client"

import { ListState } from "@/types"
import { VoteTask } from "../../../tg_usd_type"
import { formatNumber } from "@/lib/number_formatter"
import { IconSortHeader } from "@/components/icons/icon_sort_header"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { useListContext } from "@/components/design_system/list/list_context"

export const voteListState: ListState = {
  search: undefined,
  sort: {
    key: "points",
    direction: "asc",
  },
}

const computeProtocolDisplay = (protocol: string) => {
  switch (protocol.toLowerCase()) {
    case "tangent":
      return (
        <div className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-1 text-sm backdrop-blur-[60px]">
          <TokenImage token={"USG"} size={16} />
          <span>Tangent</span>
        </div>
      )

    case "convex":
      return (
        <div className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-1 text-sm backdrop-blur-[60px]">
          <TokenImage token={"CVX"} size={16} />
          <span>Convex</span>
        </div>
      )
    case "curve":
      return (
        <div className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-1 text-sm backdrop-blur-[60px]">
          <TokenImage token={"CRV"} size={16} />
          <span>Curve</span>
        </div>
      )
    case "stakedao":
      return (
        <div className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-1 text-sm backdrop-blur-[60px]">
          <TokenImage token={"SDT"} size={16} />
          <span>Stake DAO</span>
        </div>
      )
  }
}

const AirdropRowDisposition = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="flex w-full items-center justify-evenly px-2">
      <div className="flex w-3/12 items-center justify-center">{children?.at(0)} </div>
      <div className="hidden w-2/12 items-center justify-center lg:flex">{children?.at(1)} </div>
      <div className="flex w-4/12 items-center justify-center lg:w-3/12">{children?.at(2)} </div>
      <div className="flex w-2/12 items-center justify-center">{children?.at(3)} </div>
      <div className="flex w-2/12 items-center justify-center">{children?.at(4)} </div>
    </div>
  )
}

export const VoteTasksList = () => {
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
          </AirdropRowDisposition>
        </div>
      </div>

      <div className="scrollbar-thin scrollbar-thumb-white scrollbar-track-transparent max-h-[500px] overflow-y-auto">
        {displayRows &&
          (displayRows as VoteTask[])?.map((task: VoteTask) => (
            <BorderPanel
              key={task?.taskId}
              className="mb-2 bg-overlay-panel px-5 py-3 backdrop-blur-[60px] before:absolute before:inset-0 before:-z-10 before:rounded-[10px] before:opacity-70 hover:cursor-pointer hover:before:bg-list-row-hover"
            >
              <div className="hidden items-center justify-between md:flex">
                <div className="flex w-3/12 items-center gap-2 xl:gap-4">
                  <span className="flex text-xl font-semibold">{task.organisation}</span>
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
                <div className="flex w-2/12 items-center justify-center">1</div>

                <div className="flex w-2/12 items-center justify-center">{formatNumber(task?.points, 0)}</div>
              </div>

              <div className="flex flex-col items-center justify-between md:hidden">
                <div className="flex w-full items-start justify-between gap-1 border-b border-white border-opacity-20 pb-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="flex text-sm font-semibold">{task.organisation}</span>
                  </div>

                  <div className="flex flex-col items-center justify-start">
                    <span className="text-xs text-subtitle">Pts/VotingPower</span>

                    <span className="flex text-sm">1</span>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs text-subtitle">Protocol</span>

                    <span className="flex text-sm">{computeProtocolDisplay(task?.protocol)}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs text-subtitle">Points</span>

                    <span className="flex text-sm">{task.points}</span>
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
