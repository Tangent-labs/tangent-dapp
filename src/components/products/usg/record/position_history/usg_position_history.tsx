"use client"

import moment from "moment"
import { cn } from "@/lib/utils"
import { formatUnits } from "viem"
import { ListState } from "@/types"
import { UserPosition } from "../../usg_type"
import { useUSGRecordContext } from "../usg_record_context"
import Title from "@/components/design_system/structure/title"
import Loader from "@/components/design_system/structure/loader"
import Divider from "@/components/design_system/structure/divider"
import { formatBigInt, formatDollar } from "@/lib/number_formatter"
import { IconSortHeader } from "@/components/icons/icon_sort_header"
import TokenImage from "@/components/design_system/structure/token_image"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { formatActionLabel, userPositionListHeaders } from "./usg_position_history_controller"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "time",
    direction: "asc",
  },
}

const HistoryRowDisposition = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="flex items-center justify-between max-xl:flex-col">
      <div className="flex w-full items-center justify-evenly px-2">
        <div className="flex w-2/12 items-center justify-center">{children?.at(0)} </div>
        <div className="flex w-1/3 items-center justify-center">{children?.at(1)} </div>
        <div className="flex w-2/12 items-center justify-center">{children?.at(2)} </div>
        <div className="flex w-3/12 items-center justify-center md:w-1/3 lg:w-3/12">{children?.at(3)} </div>
        <div className="hidden w-1/12 items-center justify-center lg:flex">{children?.at(4)} </div>
      </div>
    </div>
  )
}

export default function TgUsdPositionHistory() {
  const { displayRows, customSort, isUserHistoryLoading } = useUSGRecordContext()

  return (
    <div className="rounded-[10px] bg-overlay-panel px-4 py-2 backdrop-blur-[60px]">
      <Title label={"Transaction history"} size={"normal"} />
      <Divider />

      <>
        {isUserHistoryLoading ? (
          <div className="flex h-full w-full items-start justify-center">
            <Loader></Loader>
          </div>
        ) : (
          <div className="flex w-full items-start justify-start gap-4">
            <div className="flex w-full flex-col">
              <ListProvider customSort={customSort} _headers={userPositionListHeaders} _rows={displayRows} _listState={listeState}>
                <PositionList></PositionList>
              </ListProvider>
            </div>
          </div>
        )}
      </>
    </div>
  )
}

function PositionList() {
  const { headers, listState, udpateSort, displayRows } = useListContext()

  const { collateralInfo } = useUSGRecordContext()

  return (
    <>
      <div className="mt-6 rounded-t-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <div className={`hidden p-4 xl:block`}>
          <HistoryRowDisposition>
            {!!headers?.at(0)?.key && (
              <div className="flex-1">
                <span>{headers?.at(0)?.label}</span>
              </div>
            )}
            {!!headers?.at(1)?.key && (
              <div key={headers?.at(1)?.label} className="flex-1">
                <button
                  className="flex w-full items-center justify-center gap-2"
                  type="button"
                  onClick={() => udpateSort && udpateSort(headers?.at(1)?.key as string)}
                >
                  <span>{headers?.at(1)?.label} </span>
                  <div className="text-row-tonic">
                    <IconSortHeader sort={(listState?.sort?.key === headers?.at(1)?.key && listState?.sort?.direction) || "none"} />
                  </div>
                </button>
              </div>
            )}
            {!!headers?.at(2)?.key && (
              <div key={headers?.at(2)?.label} className="flex-1">
                <button
                  className="flex w-full items-center justify-center gap-2"
                  type="button"
                  onClick={() => udpateSort && udpateSort(headers?.at(2)?.key as string)}
                >
                  <span>{headers?.at(2)?.label} </span>
                  <div className="text-row-tonic">
                    <IconSortHeader sort={(listState?.sort?.key === headers?.at(2)?.key && listState?.sort?.direction) || "none"} />
                  </div>
                </button>
              </div>
            )}
            {!!headers?.at(3)?.key && (
              <div key={headers?.at(3)?.label} className="flex-1">
                <button
                  className="flex w-full items-center justify-center gap-2"
                  type="button"
                  onClick={() => udpateSort && udpateSort(headers?.at(3)?.key as string)}
                >
                  <span>{headers?.at(3)?.label} </span>
                  <div className="text-row-tonic">
                    <IconSortHeader sort={(listState?.sort?.key === headers?.at(3)?.key && listState?.sort?.direction) || "none"} />
                  </div>
                </button>
              </div>
            )}
            {!!headers?.at(4)?.key && <span>{headers?.at(4)?.label}</span>}
          </HistoryRowDisposition>
        </div>
      </div>

      <div className="scrollbar-thin mt-0 h-full max-h-[200px] overflow-y-auto bg-overlay-panel backdrop-blur-[60px] lg:mt-1">
        {displayRows &&
          (displayRows as UserPosition[])?.map((pos: UserPosition) => (
            <div key={pos.txHash} className="px-5 py-2 text-[15px] hover:cursor-pointer hover:before:bg-list-row-hover">
              <div className="flex w-full items-center justify-between">
                <div
                  className={cn(
                    "hidden w-2/12 md:flex",
                    formatActionLabel(pos.label) === "Self Liquidation" || formatActionLabel(pos.label) === "Liquidation" ? "text-red-600" : "text-white"
                  )}
                >
                  {formatActionLabel(pos.label)}
                </div>
                <div className="flex w-3/12 items-center justify-center gap-1 lg:w-1/3">
                  {formatBigInt(pos.collatAmount, 18, 2)} <TokenImage token={collateralInfo.logo} size={24} />{" "}
                  <span className="hidden lg:flex"> {collateralInfo?.symbol} </span>
                  <span className="hidden text-xs text-subtitle md:flex"> {formatDollar(formatUnits(pos.collatAmount, 18), 0)}</span>
                </div>
                <div className="flex w-2/12 items-center justify-center gap-1 md:w-1/12 lg:w-2/12">
                  {formatBigInt(pos.usgAmount, 18, 2)} <TokenImage token="USG" size={16} /> <span className="hidden md:flex">USG</span>
                </div>
                <div className="flex w-1/3 items-center justify-center lg:w-3/12">
                  <span className="hidden sm:flex">
                    {moment(pos.date).format("MM-DD-YYYY")} {" - "} {moment(pos.date).format("hh:mm")}
                  </span>
                  <span className="flex sm:hidden"> {moment(pos.date).format("MM-DD-YYYY")}</span>
                </div>
                <div className="hidden w-1/12 items-center justify-center lg:flex">
                  {pos.txHash.substring(0, 4) + "..." + pos.txHash.substring(pos.txHash.length - 4, pos.txHash.length)}
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  )
}
