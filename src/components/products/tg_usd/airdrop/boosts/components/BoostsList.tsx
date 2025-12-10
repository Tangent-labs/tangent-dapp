"use client"

import { ListState } from "@/types"
import { Boost } from "../../../tg_usd_type"
import { TaskStatus } from "../../components/TaskStatus"
import { IconSortHeader } from "@/components/icons"
import { useListContext } from "@/components/design_system/list/list_context"

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
      <div className="flex w-1/3 items-center justify-center">{children?.at(0)} </div>
      <div className="flex w-1/3 items-center justify-center">{children?.at(1)} </div>
      <div className="flex w-1/6 items-center justify-center">{children?.at(2)} </div>
      <div className="flex w-1/6 items-center justify-center">{children?.at(3)} </div>
    </div>
  )
}

export const BoostsList = () => {
  const { headers, listState, udpateSort, displayRows } = useListContext()

  return (
    <>
      <div className="mb-1 mt-6 rounded-t-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <div className={`hidden p-4 leading-[10px] xl:block`}>
          <BoostRowLayout>
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
              <div key={headers?.at(2)?.label} className="flex w-full items-center justify-center">
                <button className="flex w-full justify-center gap-2" type="button" onClick={() => udpateSort && udpateSort(String(headers?.at(2)?.key))}>
                  <span>{headers?.at(2)?.label} </span>
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
          </BoostRowLayout>
        </div>
      </div>

      <div className="scrollbar-thin max-h-[560px] overflow-y-auto">
        {displayRows &&
          (displayRows as Boost[])?.map((boost: Boost) => (
            <div
              key={boost?.type}
              className="mb-1 bg-overlay-panel px-5 py-3 backdrop-blur-[60px] before:absolute before:inset-0 before:-z-10 before:rounded-[10px] before:opacity-70 hover:cursor-pointer hover:before:bg-list-row-hover"
            >
              <div className="hidden items-center justify-between md:flex">
                <div className="flex w-1/3 items-center gap-2 xl:gap-4">
                  <span className="flex text-xl font-semibold">{boost?.type}</span>
                </div>
                <div className="flex w-1/3 justify-center">
                  <div className="flex w-full items-center justify-center rounded-[10px] bg-overlay-panel px-6 py-2 text-center backdrop-blur-[60px]">
                    {boost?.description}
                  </div>
                </div>
                <div className="flex w-1/6 justify-center">+{boost?.boost}</div>
                <div className="flex w-1/6 items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-white/10 backdrop-blur-lg">
                    <TaskStatus status={boost?.status} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:hidden">
                <div className="flex w-1/2 items-center gap-2 xl:gap-4">
                  <span className="flex text-sm font-semibold">{boost?.type}</span>
                </div>

                <div className="flex w-1/6 justify-center">+{boost?.boost}</div>

                <div className="flex w-1/6 items-center justify-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white/10 backdrop-blur-lg">
                    <TaskStatus status={boost?.status} />
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  )
}
