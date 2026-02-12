"use client"

import { ListState } from "@/types"
import { Boost } from "../../../usg_type"
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
      <div className="relative mb-1 mt-4 hidden w-full xl:block">
        <div className={`w-full rounded-t-[10px] bg-overlay-panel p-4 leading-[10px] backdrop-blur-[60px]`}>
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

        {/* Gradient border effect */}
        <div
          className="pointer-events-none absolute inset-0 rounded-t-[10px]"
          style={{
            border: "1px solid transparent",
            background: "linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%, rgba(255, 255, 255, 0.1) 100%) border-box",
            WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      </div>

      {displayRows &&
        (displayRows as Boost[])?.map((boost: Boost) => (
          <div
            key={boost?.type}
            className="relative mb-1 bg-overlay-panel px-5 py-3 backdrop-blur-[60px] before:absolute before:inset-0 before:-z-10 before:opacity-70 hover:-translate-y-[1px] hover:cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:before:bg-list-row-hover hover:before:opacity-80"
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

            {/* Gradient border effect */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                border: "1px solid transparent",
                background: "linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%, rgba(255, 255, 255, 0.1) 100%) border-box",
                WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />
          </div>
        ))}
    </>
  )
}
