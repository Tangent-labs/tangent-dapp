"use client"

import { cn } from "@/lib/utils"
import { ListState } from "@/types"
import { IconOpenOutside, IconSortHeader } from "@/components/icons"
import { TaskStatus } from "../../components/TaskStatus"
import { LpTaskCustomAssetDisplay } from "./custom_token_display"
import { formatMillions } from "@/lib/number_formatter"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { useListContext } from "@/components/design_system/list/list_context"
import { ListGradientBorder } from "@/components/design_system/list/list_gradient_border"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { useRouter } from "next/navigation"
import { LpTask } from "../../../usg_type"

export const lpListState: ListState = {
  search: undefined,
  sort: {
    key: "points",
    direction: "desc",
  },
}

const computeProtocolDisplay = (protocol: string) => {
  let token: string
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
    <div className="flex w-full items-center justify-evenly px-2 text-sm">
      <div className="flex w-[35%] items-center justify-center">{children?.at(0)} </div>
      <div className="hidden w-[13%] items-center justify-center lg:flex">{children?.at(1)} </div>
      <div className="flex w-[13%] items-center justify-center">{children?.at(2)} </div>
      <div className="flex w-[13%] items-center justify-center">{children?.at(3)} </div>
      <div className="flex w-[13%] items-center justify-center">{children?.at(4)} </div>
      <div className="flex w-[13%] items-center justify-center">{children?.at(5)} </div>
    </div>
  )
}

export const LPTasksList = () => {
  const { headers, listState, udpateSort, displayRows } = useListContext()

  const router = useRouter()

  return (
    <>
      <div className="relative mb-1 mt-[10px] hidden w-full xl:block">
        <div className={`w-full rounded-t-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]`}>
          <LpTaskListDisposition>
            {!!headers?.at(0)?.key && (
              <div className="flex w-full">
                <span className="text-subtitle">{headers?.at(0)?.label}</span>
              </div>
            )}
            {!!headers?.at(1)?.key && (
              <div className="flex w-full items-center justify-center">
                <span className="text-subtitle">{headers?.at(1)?.label}</span>
              </div>
            )}

            {!!headers?.at(2)?.key && (
              <div className="flex w-full items-center justify-center">
                <button className="flex w-full items-center justify-center" type="button" onClick={() => udpateSort && udpateSort(String(headers?.at(2)?.key))}>
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-[10px] p-[5px] text-subtitle transition-colors hover:bg-white/10 hover:text-white",
                      listState?.sort?.key === headers?.at(2)?.key && listState?.sort?.direction !== "none" ? "text-white" : ""
                    )}
                  >
                    <span>{headers?.at(2)?.label}</span>
                    <IconSortHeader sort={(listState?.sort?.key === headers?.at(2)?.key && listState?.sort?.direction) || "none"} />
                  </div>
                </button>
              </div>
            )}

            {!!headers?.at(3)?.key && (
              <div key={headers?.at(3)?.label} className="flex w-full items-center justify-center">
                <button className="flex w-full items-center justify-center" type="button" onClick={() => udpateSort && udpateSort(String(headers?.at(3)?.key))}>
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-[10px] p-[5px] text-subtitle transition-colors hover:bg-white/10 hover:text-white",
                      listState?.sort?.key === headers?.at(3)?.key && listState?.sort?.direction !== "none" ? "text-white" : ""
                    )}
                  >
                    <span>{headers?.at(3)?.label}</span>
                    <IconSortHeader sort={(listState?.sort?.key === headers?.at(3)?.key && listState?.sort?.direction) || "none"} />
                  </div>
                </button>
              </div>
            )}

            {!!headers?.at(4)?.key && (
              <div key={headers?.at(4)?.label} className="flex w-full items-center justify-center">
                <button className="flex w-full items-center justify-center" type="button" onClick={() => udpateSort && udpateSort(String(headers?.at(4)?.key))}>
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-[10px] p-[5px] text-subtitle transition-colors hover:bg-white/10 hover:text-white",
                      listState?.sort?.key === headers?.at(4)?.key && listState?.sort?.direction !== "none" ? "text-white" : ""
                    )}
                  >
                    <span>{headers?.at(4)?.label}</span>
                    <IconSortHeader sort={(listState?.sort?.key === headers?.at(4)?.key && listState?.sort?.direction) || "none"} />
                  </div>
                </button>
              </div>
            )}

            {!!headers?.at(5)?.key && (
              <div key={headers?.at(5)?.label} className="flex w-full items-center justify-center">
                <button className="flex w-full items-center justify-center" type="button" onClick={() => udpateSort && udpateSort(String(headers?.at(5)?.key))}>
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-[10px] p-[5px] text-subtitle transition-colors hover:bg-white/10 hover:text-white",
                      listState?.sort?.key === headers?.at(5)?.key && listState?.sort?.direction !== "none" ? "text-white" : ""
                    )}
                  >
                    <span>{headers?.at(5)?.label}</span>
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
        (displayRows as LpTask[])?.map((task: LpTask) => (
          <div
            onClick={() => window.open(task.url, "_blank")}
            key={task?.taskId}
            className="relative mb-1 bg-overlay-panel p-[10px] backdrop-blur-[60px] hover-lift-row"
          >
            {/* Desktop */}
            <div className="hidden items-center justify-between xl:flex">
              <div className="flex w-[35%] items-center gap-2">
                <LpTaskCustomAssetDisplay token={task.asset.replaceAll("_", "-")} />

                <div className="flex h-[46.5px] flex-col items-start justify-center">
                  <span className="flex text-[15px] font-semibold">{task?.description}</span>

                  {task?.canZap && (
                    <div
                      onClick={(e) => {
                        e?.stopPropagation()
                        e?.preventDefault()
                        router.push(`/swap?tokenIn=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&tokenOut=${task?.tokenAddress}`)
                      }}
                      className="flex items-center justify-center rounded-full bg-overlay-panel px-2 py-1 text-sm hover:bg-white/10"
                    >
                      Zap
                      <IconOpenOutside className="ml-1 mt-1 flex w-4 fill-white"></IconOpenOutside>
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden w-[13%] justify-center text-[15px] lg:flex">
                <div>{computeProtocolDisplay(task?.protocol)}</div>
              </div>

              <div className="flex w-[13%] items-center justify-center text-[15px]">{(task?.pointRate * 86400).toFixed(0)}</div>

              <div className="flex w-[13%] items-center justify-center text-[15px]">{formatMillions(task?.balanceUsd)}</div>

              <div className="flex w-[13%] items-center justify-center text-[15px]">{formatMillions(task?.points)}</div>

              <div className="flex w-[13%] flex-col items-center justify-center">
                <TaskStatus status={task?.status} />
              </div>
            </div>

            {/* Mobile card */}
            <div className="flex w-full flex-col xl:hidden">
              <div className="flex w-full items-center gap-1">
                <LpTaskCustomAssetDisplay token={task.asset.replaceAll("_", "-")} />

                <div className="flex flex-row items-center gap-2">
                  <span className="text-[15px] font-semibold">{task?.description}</span>

                  {task?.canZap && (
                    <ReliefCard
                      onClick={(e) => {
                        e?.stopPropagation()
                        e?.preventDefault()
                        router.push(`/swap?tokenIn=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&tokenOut=${task?.tokenAddress}`)
                      }}
                      className="flex items-center justify-center !rounded-full px-2 py-1 text-sm"
                    >
                      Zap
                      <IconOpenOutside className="ml-1 mt-1 flex w-4 fill-white"></IconOpenOutside>
                    </ReliefCard>
                  )}
                </div>
              </div>

              <hr className="my-2 w-full opacity-20" />

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-subtitle">Protocol</span>
                  {computeProtocolDisplay(task?.protocol)}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-subtitle">Pts/Day/USD</span>
                  <span>{(task?.pointRate * 86400).toFixed(0)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-subtitle">Owned</span>
                  <span>{formatMillions(task?.balanceUsd)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-subtitle">Points</span>
                  <span>{formatMillions(task?.points)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-subtitle">Status</span>
                  <span className={`text-xs font-semibold ${task?.status ? "text-tonic" : "text-subtitle"}`}>{task?.status ? "ON" : "OFF"}</span>
                </div>
              </div>
            </div>

            <ListGradientBorder />
          </div>
        ))}
    </>
  )
}
