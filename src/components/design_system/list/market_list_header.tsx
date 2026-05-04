"use client"

import { cn } from "@/lib/utils"
import { ListGradientBorder } from "./list_gradient_border"
import { ListHeaderData, ListSort, SortedState } from "@/types"
import { IconCircleHelp, IconSortHeader } from "@/components/icons"
import { ListRowDisposition } from "@/components/design_system/list/list_row_disposition"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface ListHeaderProps {
  headers: ListHeaderData[]
  className?: string
  activeSort?: ListSort
  onSort?: (key: string) => void
  indicator?: string
  rowDisposition?: React.ComponentType<{ children: React.ReactNode[] }>
}

interface MarketHeaderDisplayProps {
  label?: string
  sort: SortedState
  onSort?: (key: string) => void
  field: string
  indicator?: string
  className?: string
}

const MarketHeaderDisplay = ({ label, sort = "none", onSort, field, indicator, className }: MarketHeaderDisplayProps) => {
  const isSortable = !!onSort
  const isActive = sort !== "none"

  return (
    <div className={cn(className, "cursor-pointer text-sm")} onClick={() => onSort && onSort(field)}>
      <div
        className={cn(
          "flex items-center gap-2 text-subtitle",
          isSortable && "rounded-[10px] p-[5px] transition-colors hover:bg-white/10 hover:text-white",
          isSortable && isActive && "text-white"
        )}
      >
        <span>{label}</span>
        {indicator && (
          <HoverCard openDelay={150} closeDelay={100}>
            <HoverCardTrigger asChild>
              <button type="button" className="inline-flex items-center">
                <IconCircleHelp className={isActive ? "w-3 fill-white" : "w-3 fill-subtitle"} />
              </button>
            </HoverCardTrigger>

            <HoverCardContent side="top" align="center" className="z-1001 w-fit max-w-64 p-2 text-xs">
              {indicator}
            </HoverCardContent>
          </HoverCard>
        )}
        {isSortable && <IconSortHeader sort={sort} />}
      </div>
    </div>
  )
}

export const MarketListHeader = ({ headers, activeSort, onSort, rowDisposition: CustomRowDisposition = ListRowDisposition }: ListHeaderProps) => {
  return (
    <div className="relative mt-4 hidden w-full xl:block">
      <div className={`w-full rounded-t-[10px] bg-overlay-panel p-2 leading-[10px] backdrop-blur-[60px]`}>
        <CustomRowDisposition>
          {!!headers[0]?.key && (
            <MarketHeaderDisplay
              key={headers[0]?.key}
              label={headers[0]?.label}
              sort={(activeSort?.key == headers[0]?.key && activeSort?.direction) || "none"}
              field={headers[0]?.key || ""}
              onSort={!!headers[0]?.sort ? onSort : undefined}
              indicator={headers[0]?.indicator}
              className="flex w-full items-center justify-start pl-2"
            />
          )}
          {!!headers[1]?.key && (
            <MarketHeaderDisplay
              key={headers[1]?.key}
              label={headers[1]?.label}
              sort={(activeSort?.key == headers[1]?.key && activeSort?.direction) || "none"}
              field={headers[1]?.key || ""}
              onSort={!!headers[1]?.sort ? onSort : undefined}
              indicator={headers[1]?.indicator}
              className="flex w-full items-center justify-center"
            />
          )}
          {!!headers[2]?.key && (
            <MarketHeaderDisplay
              key={headers[2]?.key}
              label={headers[2]?.label}
              sort={(activeSort?.key == headers[2]?.key && activeSort?.direction) || "none"}
              field={headers[2]?.key || ""}
              onSort={!!headers[2]?.sort ? onSort : undefined}
              indicator={headers[2]?.indicator}
              className="flex w-full items-center justify-center"
            />
          )}
          <>
            {headers
              ?.slice(3)
              ?.map((header) => (
                <MarketHeaderDisplay
                  key={header.key}
                  label={header.label}
                  sort={(activeSort?.key == header.key && activeSort?.direction) || "none"}
                  field={header.key}
                  onSort={!!header.sort ? onSort : undefined}
                  indicator={header.indicator}
                  className="flex w-full flex-1 items-center justify-center"
                />
              ))}
          </>
        </CustomRowDisposition>
      </div>

      <ListGradientBorder classname={"rounded-t-[10px]"} />
    </div>
  )
}
