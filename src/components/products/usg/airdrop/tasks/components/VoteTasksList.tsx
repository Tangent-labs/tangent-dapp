"use client"

import { ListState } from "@/types"
import { VoteTask } from "../../../usg_type"
import { formatNumber } from "@/lib/number_formatter"
import { IconSortHeader } from "@/components/icons"
import { TokenImage } from "@/components/design_system/structure/token_image"
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
        <>
          <TokenImage token={"USG"} size={16} />
          <span>Tangent</span>
        </>
      )

    case "cvx.eth":
    case "convex":
      return (
        <>
          <TokenImage token={"CVX"} size={16} />
          <span>Convex</span>
        </>
      )

    case "curve":
    case "crv":
      return (
        <>
          <TokenImage token={"CRV"} size={16} />
          <span>Curve</span>
        </>
      )

    case "fxn":
      return (
        <>
          <TokenImage token={"FXN"} size={16} />
          <span>FXN</span>
        </>
      )

    case "sdcrv.eth":
    case "sdfxn.eth":
    case "sdpendle.eth":
    case "stakedao":
      return (
        <>
          <TokenImage token={"SDT"} size={16} />
          <span>Stake DAO</span>
        </>
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
              <div className="hidden w-2/12 justify-center lg:flex">
                <div className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-2 text-sm backdrop-blur-[60px]">
                  {computeProtocolDisplay(task.organisation)}
                </div>
              </div>
              <div className="flex w-4/12 justify-center lg:w-3/12">
                <div className="text flex items-center justify-center">{task?.pointRate}</div>
              </div>
              <div className="flex w-2/12 items-center justify-center">{formatNumber(task.points, 0)}</div>

              <div className="flex w-2/12 items-center justify-center">{formatNumber(task.lastVotingPower, 0)}</div>
            </div>

            <div className="flex flex-col items-center justify-between md:hidden">
              <div className="mb-1 flex w-full items-center justify-center text-sm font-semibold"> {task?.description}</div>

              <div className="flex w-full items-center justify-between gap-1 border-t border-white border-opacity-20 py-2">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs text-subtitle">Current Vote</span>
                  <span className="flex text-sm">{task.lastVotingPower}</span>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <span className="flex items-center justify-center gap-2 rounded-[10px] bg-overlay-panel px-4 py-2 text-sm backdrop-blur-[60px]">
                    {computeProtocolDisplay(task?.protocol)}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs text-subtitle">Points</span>
                  <span className="flex text-sm">{task.points}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
    </>
  )
}
