"use client"

import moment from "moment"
import { cn } from "@/lib/utils"
import { formatUnits } from "viem"
import { UserPosition } from "../../usg_type"
import { useUSGRecordContext } from "../usg_record_context"
import { Switch } from "@/components/ui/switch"
import { Title } from "@/components/design_system/structure/title"
import { Divider } from "@/components/design_system/structure/divider"
import { formatBigInt, formatDollar } from "@/lib/number_formatter"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { formatActionLabel, userPositionListHeaders } from "./usg_position_history_controller"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { ArrowUpRight } from "lucide-react"
import { UI_V2 } from "@/v2/ui"

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

export function USGPositionHistory() {
  const { isUserConnected, showUserHistoryOnly, setShowUserHistoryOnly } = useUSGRecordContext()

  if (UI_V2)
    return (
      <ReliefCard className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[15px] font-semibold">Transaction history</span>
          {isUserConnected && (
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-2">
              Only my transactions
              <Switch checked={showUserHistoryOnly} onCheckedChange={setShowUserHistoryOnly} />
            </label>
          )}
        </div>
        <PositionTableV2 />
      </ReliefCard>
    )

  return (
    <ReliefCard className="p-5">
      <div className="flex items-center justify-between">
        <Title label={"Transaction history"} size={"normal"} />
        {isUserConnected && (
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-subtitle md:flex">Only show my tx</span>
            <span className="flex text-sm text-subtitle md:hidden">My tx</span>
            <Switch checked={showUserHistoryOnly} onCheckedChange={setShowUserHistoryOnly} />
          </div>
        )}
      </div>
      <Divider />

      <PositionList />
    </ReliefCard>
  )
}

function PositionList() {
  const { displayRows, collateralInfo, historyPage, setHistoryPage, historyTotalPages } = useUSGRecordContext()

  const onClickTxHash = (hash: string) => {
    window.open(`https://etherscan.io/tx/${hash}`, "_blank")
  }

  return (
    <div className="flex w-full flex-col">
      <div className="rounded-t-[10px] bg-overlay-panel">
        <div className="hidden p-[10px] text-sm xl:block">
          <HistoryRowDisposition>
            {userPositionListHeaders.map((header) => (
              <span key={header.key} className="text-subtitle">
                {header.label}
              </span>
            ))}
          </HistoryRowDisposition>
        </div>
      </div>

      <div className="scrollbar-thin mt-0 h-full max-h-[200px] overflow-y-auto bg-overlay-panel lg:mt-1">
        {displayRows.length === 0 ? (
          <div className="flex w-full items-center justify-center px-5 py-6 text-sm text-subtitle">No transactions yet</div>
        ) : (
          (displayRows as UserPosition[]).map((pos: UserPosition) => (
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
                  {formatBigInt(pos.collatAmount, 18, 2)} <TokenImage token={collateralInfo.logoKey} size={24} />
                  <span className="hidden lg:flex"> {collateralInfo?.symbol} </span>
                  <span className="hidden text-xs text-subtitle md:flex">
                    {formatDollar(formatUnits(BigInt(pos.collatAmount) * BigInt(Number(collateralInfo?.price?.toFixed(0))), 18), 0)}
                  </span>
                </div>
                <div className="flex w-2/12 items-center justify-center gap-1 md:w-1/12 lg:w-2/12">
                  {formatBigInt(pos.usgAmount, 18, 2)} <TokenImage token="USG" size={16} /> <span className="hidden md:flex">USG</span>
                </div>
                <div className="hidden w-1/3 items-center justify-center lg:flex lg:w-3/12">
                  {moment(pos.date).format("MM-DD-YYYY")} {" - "} {moment(pos.date).format("hh:mm")}
                </div>
                <div onClick={() => onClickTxHash(pos.txHash)} className="flex w-1/3 cursor-pointer items-center justify-center hover:underline lg:w-1/12">
                  {pos.txHash.substring(0, 4) + "..." + pos.txHash.substring(pos.txHash.length - 4, pos.txHash.length)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {displayRows.length > 0 && (
        <div className="flex w-full items-center justify-between rounded-b-[10px] bg-overlay-panel px-5 py-3 text-sm">
          <button
            type="button"
            disabled={historyPage <= 1}
            onClick={() => setHistoryPage(historyPage - 1)}
            className="rounded-[10px] px-3 py-1 text-subtitle transition-colors enabled:hover:bg-white/10 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-subtitle">
            Page {historyPage} of {historyTotalPages}
          </span>
          <button
            type="button"
            disabled={historyPage >= historyTotalPages}
            onClick={() => setHistoryPage(historyPage + 1)}
            className="rounded-[10px] px-3 py-1 text-subtitle transition-colors enabled:hover:bg-white/10 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function PositionTableV2() {
  const { displayRows, collateralInfo, historyPage, setHistoryPage, historyTotalPages } = useUSGRecordContext()
  const rows = displayRows as UserPosition[]
  const pager =
    "rounded-md px-2.5 py-1 text-ink-2 transition-colors enabled:hover:bg-white/[0.06] enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"

  return (
    <div className="mt-3">
      <div className="v2-scroll max-h-[420px] overflow-auto pr-1">
        <table className="w-full min-w-[640px] text-[13px]">
          <thead className="sticky top-0 bg-surface text-xs text-ink-3">
            <tr className="border-b border-divider">
              <th className="py-2.5 pr-3 text-left font-normal">Action</th>
              <th className="px-3 py-2.5 text-right font-normal">Collateral</th>
              <th className="px-3 py-2.5 text-right font-normal">USG</th>
              <th className="px-3 py-2.5 text-right font-normal">Time</th>
              <th className="py-2.5 pl-3 text-right font-normal">Tx</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-ink-3">
                  No transactions yet
                </td>
              </tr>
            ) : (
              rows.map((pos) => {
                const label = formatActionLabel(pos.label)
                const liquidation = label === "Self Liquidation" || label === "Liquidation"
                return (
                  <tr key={pos.txHash} className="border-b border-divider transition-colors last:border-0 hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-3">
                      <span className="flex items-center gap-2">
                        {liquidation && <span className="h-1.5 w-1.5 rounded-full bg-negative" />}
                        <span className={liquidation ? "text-negative" : "text-white"}>{label}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      <span className="inline-flex items-center gap-1.5">
                        {formatBigInt(pos.collatAmount, 18, 2)}
                        <TokenImage token={collateralInfo.logoKey} size={16} className="h-4 w-auto" />
                      </span>
                      <div className="text-xs text-ink-3">
                        {formatDollar(formatUnits(BigInt(pos.collatAmount) * BigInt(Number(collateralInfo?.price?.toFixed(0))), 18), 0)}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      <span className="inline-flex items-center gap-1.5">
                        {formatBigInt(pos.usgAmount, 18, 2)}
                        <TokenImage token="USG" size={16} />
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-ink-2">{moment(pos.date).format("MMM D, YYYY HH:mm")}</td>
                    <td className="py-2.5 pl-3 text-right">
                      <a
                        href={`https://etherscan.io/tx/${pos.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 tabular-nums text-ink-2 transition-colors hover:text-white"
                      >
                        {pos.txHash.substring(0, 4) + "…" + pos.txHash.substring(pos.txHash.length - 4)}
                        <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
                      </a>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {rows.length > 0 && (
        <div className="mt-3 flex items-center justify-between text-[13px]">
          <button type="button" disabled={historyPage <= 1} onClick={() => setHistoryPage(historyPage - 1)} className={pager}>
            Previous
          </button>
          <span className="tabular-nums text-ink-3">
            Page {historyPage} of {historyTotalPages}
          </span>
          <button type="button" disabled={historyPage >= historyTotalPages} onClick={() => setHistoryPage(historyPage + 1)} className={pager}>
            Next
          </button>
        </div>
      )}
    </div>
  )
}
