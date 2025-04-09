"use client"

import { AirdropTask } from "../tg_usd_type"
import { ExistingAsset, ListState } from "@/types"
import Loader from "@/components/design_system/structure/loader"
import { useTgUsdAirdropContext } from "./tg_usd_airdrop_context"
import { airdropListHeaders } from "./tg_usd_airdrop_controller"
import { Button } from "@/components/design_system/inputs/button"
import ListAsset from "@/components/design_system/list/list_asset"
import { IconSortHeader } from "@/components/icons/icon_sort_header"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "market",
    direction: "asc",
  },
}

const TaskStatus = ({ status }: { status: string }) => {
  switch (status) {
    case "ongoing":
      return <div className="h-2 w-2 rounded-full bg-light-tonic outline outline-1 outline-offset-4 outline-light-tonic"></div>
    case "not_started":
      return <div className="h-2 w-2 rounded-full bg-subtitle"></div>
  }
}

const AirdropRowDisposition = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="flex items-center justify-between max-xl:flex-col">
      <div className="flex w-full items-center justify-evenly xl:w-8/12 xl:justify-start">
        <div className="xl:w-1/3">{children?.at(0)}</div>
        <div className="flex justify-center xl:w-1/3">{children?.at(1)}</div>
        <div className="flex justify-center xl:w-1/3">{children?.at(2)}</div>
      </div>
      <hr className="my-4 w-full opacity-20 xl:hidden" />
      <div className="flex h-full w-full flex-wrap items-center justify-evenly gap-2 xl:w-4/12">{children?.at(3)}</div>
    </div>
  )
}

export default function TgUsdAidropContent() {
  const { displayRows, isLoading, customSort } = useTgUsdAirdropContext()

  return (
    <>
      {isLoading ? (
        <div className="flex h-full w-full items-start justify-center">
          <Loader></Loader>
        </div>
      ) : (
        <div className="flex w-full items-start justify-start gap-4">
          <div className="flex w-full flex-col">
            <ListProvider customSort={customSort} _headers={airdropListHeaders} _rows={displayRows} _listState={listeState}>
              <AirdropList></AirdropList>
            </ListProvider>
          </div>
        </div>
      )}
    </>
  )
}

function AirdropList() {
  const { headers, listState, udpateSort, displayRows } = useListContext()

  return (
    <>
      <div className="mb-1 mt-6 rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <div className={`hidden p-4 leading-[10px] xl:block`}>
          <AirdropRowDisposition>
            {!!headers?.at(0)?.key && (
              <div className="flex-1">
                <span>{headers?.at(0)?.label}</span>
              </div>
            )}
            {!!headers?.at(1)?.key && (
              <div className="flex-1">
                <span>{headers?.at(1)?.label}</span>
              </div>
            )}
            {!!headers?.at(2)?.key && (
              <div className="flex-1">
                <span>{headers?.at(2)?.label}</span>
              </div>
            )}
            <>
              {headers.slice(3).map((header) => (
                <div key={header?.label} className="flex-1">
                  <button className="flex w-full justify-center gap-2" type="button" onClick={() => udpateSort && udpateSort(header.key)}>
                    <span>{header?.label} </span>
                    <div className="text-row-tonic">
                      <IconSortHeader sort={(listState?.sort?.key === header?.key && listState?.sort?.direction) || "none"} />
                    </div>
                  </button>
                </div>
              ))}
            </>
          </AirdropRowDisposition>
        </div>
      </div>

      <div className="scrollbar-thin scrollbar-thumb-white scrollbar-track-transparent max-h-[500px] overflow-y-auto">
        {displayRows &&
          (displayRows as AirdropTask[])?.map((task: AirdropTask) => (
            <PanelRaw
              key={task.actionLabel}
              className="mb-2 border px-5 py-3 before:absolute before:inset-0 before:-z-10 before:rounded-[10px] before:opacity-70 hover:cursor-pointer hover:before:bg-list-row-hover"
            >
              <div className="flex items-center justify-between max-xl:flex-col">
                <div className="flex w-full items-center justify-evenly xl:w-8/12 xl:justify-start">
                  <div className="xl:w-1/3">
                    <ListAsset name={task?.name} token={task?.asset as ExistingAsset} assetsEarned={[]} />
                  </div>
                  <div className="flex justify-center xl:w-1/3">
                    <div onClick={() => window.open(task?.link, "_blank", "noopener,noreferrer")}>{task?.protocolName}</div>
                  </div>
                  <div className="flex justify-center xl:w-1/3">
                    <Button onClick={() => window.open(task?.link, "_blank", "noopener,noreferrer")}>{task?.actionLabel}</Button>
                  </div>
                </div>
                <div className="flex h-full w-full items-center justify-evenly gap-2 xl:w-4/12">
                  <div className="flex w-1/3 items-center justify-center">{task?.ptsPerDay}</div>
                  <div className="flex w-1/3 items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-lg">
                      <TaskStatus status={task?.status} />
                    </div>
                  </div>
                  <div className="flex w-1/3 items-center justify-center">{task?.totalPoints}</div>
                </div>
              </div>
            </PanelRaw>
          ))}
      </div>
    </>
  )
}
