"use client"

import { ListState } from "@/types"
import { VoteTask } from "../../../usg_type"
import { formatMillions } from "@/lib/number_formatter"
import { IconSortHeader } from "@/components/icons"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { useListContext } from "@/components/design_system/list/list_context"
import { ListGradientBorder } from "@/components/design_system/list/list_gradient_border"

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
    <div className="flex w-full items-center justify-evenly">
      <div className="flex w-[35%] items-center justify-center">{children?.at(0)} </div>
      <div className="hidden w-[16.25%] items-center justify-center lg:flex">{children?.at(1)} </div>
      <div className="flex w-[16.25%] items-center justify-center">{children?.at(2)} </div>
      <div className="flex w-[16.25%] items-center justify-center">{children?.at(3)} </div>
      <div className="flex w-[16.25%] items-center justify-center">{children?.at(4)} </div>
    </div>
  )
}

export const VoteTasksList = () => {
  const { headers, listState, udpateSort, displayRows } = useListContext()

  return (
    <>
      <div className="relative mb-1 mt-4 hidden w-full xl:block">
        <div className={`w-full rounded-t-[10px] bg-overlay-panel p-2 text-sm leading-[10px] backdrop-blur-[60px]`}>
          <VoteTaskListDisposition>
            {!!headers?.at(0)?.key && (
              <div className="flex w-full pl-2">
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
                <button className="flex w-full justify-center gap-2" type="button" onClick={() => udpateSort && udpateSort(String(headers?.at(2)?.key))}>
                  <span>{headers?.at(2)?.label}</span>
                  <div className="text-row-tonic">
                    <IconSortHeader sort={(listState?.sort?.key === headers?.at(2)?.key && listState?.sort?.direction) || "none"} />
                  </div>
                </button>
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
        <ListGradientBorder classname={"rounded-t-[10px]"} />
      </div>

      {displayRows &&
        (displayRows as VoteTask[])?.map((task: VoteTask) => (
          <div
            key={task?.taskId}
            className="relative mb-1 bg-overlay-panel p-[10px] backdrop-blur-[60px] hover-lift-row"
            onClick={() => window.open(task?.url, "_blank", "noopener,noreferrer")}
          >
            {/* Desktop */}
            <div className="hidden items-center justify-between xl:flex">
              <div className="flex w-[35%] items-center gap-2 xl:gap-4">
                <span className="flex text-[15px] font-semibold">{task.description}</span>
              </div>
              <div className="hidden w-[16.25%] justify-center lg:flex">
                <div className="flex items-center justify-center gap-2 rounded-full bg-overlay-panel px-2 py-1 text-sm backdrop-blur-[60px]">
                  {computeProtocolDisplay(task.organisation)}
                </div>
              </div>
              <div className="flex w-[16.25%] justify-center lg:w-[15%]">
                <div className="text flex items-center justify-center">{task?.pointRate}</div>
              </div>
              <div className="flex w-[16.25%] items-center justify-center">{formatMillions(task.points)}</div>
              <div className="flex w-[16.25%] items-center justify-center">{formatMillions(task.lastVotingPower)}</div>
            </div>

            {/* Mobile card */}
            <div className="flex w-full flex-col xl:hidden">
              <span className="text-[15px] font-semibold">{task?.description}</span>

              <hr className="my-2 w-full opacity-20" />

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-subtitle">Protocol</span>
                  <div className="flex items-center justify-center gap-2 rounded-full bg-overlay-panel px-2 py-1 text-sm backdrop-blur-[60px]">
                    {computeProtocolDisplay(task.organisation)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-subtitle">Pts/Epoch/Tkn</span>
                  <span>{task?.pointRate}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-subtitle">Points</span>
                  <span>{formatMillions(task.points)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-subtitle">Current Vote</span>
                  <span>{formatMillions(task.lastVotingPower)}</span>
                </div>
              </div>
            </div>

            <ListGradientBorder />
          </div>
        ))}
    </>
  )
}
