"use client"

import { ListState } from "@/types"
import { Boost } from "../../../usg_type"
import { TaskStatus } from "../../components/TaskStatus"
import { IconSortHeader } from "@/components/icons"
import { useListContext } from "@/components/design_system/list/list_context"
import { ListGradientBorder } from "@/components/design_system/list/list_gradient_border"

export const boostsListState: ListState = {
  search: undefined,
  sort: {
    key: "points",
    direction: "asc",
  },
}

const BoostRowLayout = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="flex w-full items-center justify-evenly px-2">
      <div className="flex w-1/2 items-center justify-center">{children?.at(0)} </div>
      <div className="flex w-1/4 items-center justify-center">{children?.at(1)} </div>
      <div className="flex w-1/4 items-center justify-center">{children?.at(2)} </div>
    </div>
  )
}

export const BoostsList = () => {
  const { headers, listState, udpateSort, displayRows } = useListContext()

  return (
    <>
      <div className="relative mb-1 mt-4 hidden w-full xl:block">
        <div className={`w-full rounded-t-[10px] bg-overlay-panel p-4 leading-[10px] backdrop-blur-[60px]`}>
          <BoostRowLayout>
            {!!headers?.at(0)?.key && (
              <div className="flex w-full">
                <span>{headers?.at(0)?.label}</span>
              </div>
            )}

            {!!headers?.at(1)?.key && (
              <div key={headers?.at(1)?.label} className="flex w-full items-center justify-center">
                <button className="flex w-full justify-center gap-2" type="button" onClick={() => udpateSort && udpateSort(String(headers?.at(1)?.key))}>
                  <span>{headers?.at(1)?.label} </span>
                  <div className="text-row-tonic">
                    <IconSortHeader sort={(listState?.sort?.key === headers?.at(1)?.key && listState?.sort?.direction) || "none"} />
                  </div>
                </button>
              </div>
            )}

            {!!headers?.at(2)?.key && (
              <div key={headers?.at(2)?.label} className="flex w-full items-center justify-center">
                <button className="flex w-full justify-center gap-2" type="button" onClick={() => udpateSort && udpateSort(String(headers?.at(2)?.key))}>
                  <span>{headers?.at(2)?.label} </span>
                  <div className="text-row-tonic">
                    <IconSortHeader sort={(listState?.sort?.key === headers?.at(2)?.key && listState?.sort?.direction) || "none"} />
                  </div>
                </button>
              </div>
            )}
          </BoostRowLayout>
        </div>
        <ListGradientBorder classname={"rounded-t-[10px]"} />
      </div>

      {displayRows &&
        (displayRows as Boost[])?.map((boost: Boost) => (
          <div key={boost?.type} className="relative mb-1 bg-overlay-panel p-2 backdrop-blur-[60px] hover-lift-row xl:px-5 xl:py-3">
            <div className="hidden items-center justify-between md:flex">
              <div className="flex w-1/2 items-center gap-2 xl:gap-4">
                <span className="flex text-[15px] font-semibold">{boost?.type}</span>
              </div>
              <div className="flex w-1/4 justify-center text-[15px]">+{boost?.boost}</div>
              <div className="flex w-1/4 items-center justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/10 backdrop-blur-lg">
                  <TaskStatus status={boost?.status} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:hidden">
              <div className="flex w-1/2 items-center gap-2 xl:gap-4">
                <span className="flex text-sm font-semibold">{boost?.type}</span>
              </div>

              <div className="flex w-1/4 justify-center text-[15px]">+{boost?.boost}</div>

              <div className="flex w-1/4 items-center justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white/10 backdrop-blur-lg">
                  <TaskStatus status={boost?.status} />
                </div>
              </div>
            </div>
            <ListGradientBorder />
          </div>
        ))}
    </>
  )
}
