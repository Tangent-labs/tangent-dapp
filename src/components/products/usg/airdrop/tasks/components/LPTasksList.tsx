"use client"

import { UserTask } from "../../../usg_type"
import { ExistingAsset, ListState } from "@/types"
import { IconSortHeader } from "@/components/icons"
import { formatToken } from "../usg_tasks_controller"
import { TaskStatus } from "../../components/TaskStatus"
import { LpTaskCustomAssetDisplay } from "./custom_token_display"
import { formatNumber, formatDollar } from "@/lib/number_formatter"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { useListContext } from "@/components/design_system/list/list_context"
import { ListGradientBorder } from "@/components/design_system/list/list_gradient_border"
import { ReliefCard } from "@/components/design_system/structure/relief_card"

export const lpListState: ListState = {
  search: undefined,
  sort: {
    key: "status",
    direction: "asc",
  },
}

const computeProtocolDisplay = (protocol: string) => {
  let token: ExistingAsset
  let label = ""

  switch (protocol.toLowerCase()) {
    case "tangent":
      token = "USG"
      label = "Tangent"
      break
    case "convex":
      token = "CVX"
      label = "Convex"
      break
    case "curve":
      token = "CRV"
      label = "Curve"
      break
    case "stakedao":
      token = "SDT"
      label = "Stake DAO"
      break
    case "pendle":
      token = "PENDLE"
      label = "Pendle"
      break
    default:
      token = "CRV"
      label = "Curve"
  }

  return (
    <div className="flex items-center justify-center gap-2 rounded-full bg-overlay-panel px-2 py-1 text-xs backdrop-blur-[60px] md:text-sm">
      <TokenImage token={token} size={16} />

      <span>{label}</span>
    </div>
  )
}

const LpTaskListDisposition = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="flex w-full items-center justify-evenly px-2">
      <div className="flex w-5/12 items-center justify-center">{children?.at(0)} </div>
      <div className="hidden w-2/12 items-center justify-center lg:flex">{children?.at(1)} </div>
      <div className="flex w-1/12 items-center justify-center">{children?.at(2)} </div>
      <div className="flex w-1/12 items-center justify-center">{children?.at(3)} </div>
      <div className="flex w-2/12 items-center justify-center">{children?.at(4)} </div>
      <div className="flex w-1/12 items-center justify-center">{children?.at(5)} </div>
    </div>
  )
}

export const LPTasksList = () => {
  const { headers, listState, udpateSort, displayRows } = useListContext()

  return (
    <>
      <div className="relative mb-1 mt-4 hidden w-full xl:block">
        <div className={`w-full rounded-t-[10px] bg-overlay-panel p-4 leading-[10px] backdrop-blur-[60px]`}>
          <LpTaskListDisposition>
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
                <button
                  className="flex w-full items-center justify-center gap-2"
                  type="button"
                  onClick={() => udpateSort && udpateSort(String(headers?.at(3)?.key))}
                >
                  <span>{headers?.at(3)?.label} </span>
                  <div className="text-row-tonic">
                    <IconSortHeader sort={(listState?.sort?.key === headers?.at(3)?.key && listState?.sort?.direction) || "none"} />
                  </div>
                </button>
              </div>
            )}

            {!!headers?.at(4)?.key && (
              <div key={headers?.at(4)?.label} className="flex w-full items-center justify-center">
                <button
                  className="flex w-full items-center justify-center gap-2"
                  type="button"
                  onClick={() => udpateSort && udpateSort(String(headers?.at(4)?.key))}
                >
                  <span>{headers?.at(4)?.label} </span>
                  <div className="text-row-tonic">
                    <IconSortHeader sort={(listState?.sort?.key === headers?.at(4)?.key && listState?.sort?.direction) || "none"} />
                  </div>
                </button>
              </div>
            )}

            {!!headers?.at(5)?.key && (
              <div key={headers?.at(5)?.label} className="flex w-full items-center justify-center">
                <button
                  className="‚ flex w-full items-center justify-center gap-2"
                  type="button"
                  onClick={() => udpateSort && udpateSort(String(headers?.at(5)?.key))}
                >
                  <span>{headers?.at(5)?.label} </span>
                  <div className="text-row-tonic">
                    <IconSortHeader sort={(listState?.sort?.key === headers?.at(5)?.key && listState?.sort?.direction) || "none"} />
                  </div>
                </button>
              </div>
            )}
          </LpTaskListDisposition>
        </div>

        <ListGradientBorder classname={"rounded-t-[10px]"} />
      </div>

      {displayRows &&
        (displayRows as UserTask[])?.map((task: UserTask) => (
          <div
            onClick={() => window.open(task.url, "_blank")}
            key={task?.taskId}
            className="relative mb-1 bg-overlay-panel px-2 py-2 backdrop-blur-[60px] hover-lift-row lg:px-5"
          >
            <div className="hidden items-center justify-between md:flex">
              <div className="flex w-5/12 items-center gap-2">
                <LpTaskCustomAssetDisplay token={task.asset.replaceAll("_", "-") as ExistingAsset} />

                <div className="flex h-full flex-col items-start justify-between">
                  <span className="flex text-[15px] font-semibold">{task?.description}</span>

                  <ReliefCard className="flex items-center justify-center !rounded-full px-4 py-1 text-sm">Zap</ReliefCard>
                </div>
              </div>

              <div className="hidden w-2/12 justify-center lg:flex">
                <div>{computeProtocolDisplay(task?.protocol)}</div>
              </div>

              <div className="flex w-1/12 items-center justify-center text-[15px]">{(task?.pointRate * 86400).toFixed(0)}</div>

              <div className="flex w-1/12 items-center justify-center text-[15px]">{formatDollar(task?.balanceUsd)}</div>

              <div className="flex w-2/12 items-center justify-center text-[15px]">{formatNumber(task?.points, 0)}</div>

              <div className="flex w-1/12 flex-col items-center justify-center">
                <div className="flex h-10 w-10 flex-col items-center justify-center rounded-[10px] bg-white/10 backdrop-blur-lg">
                  <TaskStatus status={task?.status} />
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center md:hidden">
              <div className="mb-1 flex w-full items-center justify-center text-sm font-semibold"> {task?.description}</div>

              <div className="flex w-full items-center justify-between gap-1 border-t border-white border-opacity-10 py-2">
                <div className="flex items-center justify-center gap-2">
                  <TokenImage token={formatToken(task.asset)} className="w-8" size={48} />

                  <span className="flex text-sm font-semibold">{task.asset}</span>
                </div>

                <div className="flex flex-col items-center justify-center text-sm">{computeProtocolDisplay(task?.protocol)}</div>

                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs text-subtitle">Points</span>

                  <span className="flex text-sm">{formatNumber(task.points, 0)}</span>
                </div>
              </div>
            </div>

            <ListGradientBorder />
          </div>
        ))}
    </>
  )
}
