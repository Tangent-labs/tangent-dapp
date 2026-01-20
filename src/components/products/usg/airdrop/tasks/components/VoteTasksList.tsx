"use client"

import { ListState } from "@/types"
import { VoteTask } from "../../../usg_type"
import { formatNumber } from "@/lib/number_formatter"
import { IconSortHeader } from "@/components/icons"
import TokenImage from "@/components/design_system/structure/token_image"
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

    case "cvx.eth":
    case "convex":
      return (
        <div className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-1 text-sm backdrop-blur-[60px]">
          <TokenImage token={"CVX"} size={16} />
          <span>Convex</span>
        </div>
      )

    case "curve":
    case "crv":
      return (
        <div className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-1 text-sm backdrop-blur-[60px]">
          <TokenImage token={"CRV"} size={16} />
          <span>Curve</span>
        </div>
      )

    case "fxn":
      return (
        <div className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-1 text-sm backdrop-blur-[60px]">
          <TokenImage token={"FXN"} size={16} />
          <span>FXN</span>
        </div>
      )

    case "sdcrv.eth":
    case "sdfxn.eth":
    case "sdpendle.eth":
    case "stakedao":
      return (
        <div className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-1 text-sm backdrop-blur-[60px]">
          <TokenImage token={"SDT"} size={16} />
          <span>Stake DAO</span>
        </div>
      )
  }
}

const VoteTaskListDisposition = ({ children }: { children: React.ReactNode[] }) => {
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
      <div className="mb-1 mt-6 rounded-t-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <div className={`hidden p-4 leading-[10px] xl:block`}>
          <VoteTaskListDisposition>
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
          </VoteTaskListDisposition>
        </div>
      </div>

      {displayRows &&
        (displayRows as VoteTask[])?.map((task: VoteTask) => (
          <div
            key={task?.taskId}
            className="mb-1 bg-overlay-panel px-5 py-3 backdrop-blur-[60px] before:absolute before:inset-0 before:-z-10 before:opacity-70 hover:cursor-pointer hover:before:bg-list-row-hover"
            onClick={() => window.open(task?.url, "_blank", "noopener,noreferrer")}
          >
            <div className="hidden items-center justify-between md:flex">
              <div className="flex w-3/12 items-center gap-2 xl:gap-4">
                <span className="flex text-xl font-semibold">{task.description}</span>
              </div>
              <div className="hidden w-2/12 justify-center lg:flex">{computeProtocolDisplay(task.organisation)}</div>
              <div className="flex w-4/12 justify-center lg:w-3/12">
                <div className="text flex items-center justify-center">{task?.pointRate}</div>
              </div>
              <div className="flex w-2/12 items-center justify-center">{formatNumber(task.points, 0)}</div>

              <div className="flex w-2/12 items-center justify-center">{formatNumber(task.lastVotingPower, 0)}</div>
            </div>

            <div className="flex flex-col items-center justify-between md:hidden">
              <div className="flex w-full items-start justify-between gap-1 border-b border-white border-opacity-20 pb-2">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs text-subtitle">Protocol</span>
                  <span className="flex text-sm">{computeProtocolDisplay(task?.protocol)}</span>
                </div>
                <div className="flex flex-col items-center justify-start">
                  <span className="text-xs text-subtitle">Pts/VotingPower</span>
                  <span className="flex text-sm">{task.pointRate}</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs text-subtitle">Points</span>
                  <span className="flex text-sm">{task.points}</span>
                </div>
              </div>
              <div className="flex w-full items-center justify-center"> {task?.description}</div>
            </div>
          </div>
        ))}
    </>
  )
}
