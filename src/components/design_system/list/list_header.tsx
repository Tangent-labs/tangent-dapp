"use client"

import { USGHoverCard } from "../structure/usg_hover_card"
import { ListHeaderData, ListSort, SortedState } from "@/types"
import { IconSortHeader } from "@/components/icons"
import { ListRowDisposition } from "@/components/design_system/list/list_row_disposition"
import { cn } from "@/lib/utils"
import { ListGradientBorder } from "./list_gradient_border"

interface ListHeaderProps {
  headers: ListHeaderData[]
  activeSort?: ListSort
  onSort?: (key: string) => void
  indicator?: string
  rowDisposition?: React.ComponentType<{ children: React.ReactNode[] }>
}

interface HeaderDisplayProps {
  label?: string
  sort: SortedState
  onSort?: (key: string) => void
  field: string
  indicator?: string
  className?: string
}

const HeaderDisplay = ({ label, sort = "none", onSort, field, indicator, className }: HeaderDisplayProps) => {
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
          <USGHoverCard iconClassName={isActive ? "fill-white w-[13px]" : "fill-subtitle w-[13px]"} title={label as string}>
            {indicator}
          </USGHoverCard>
        )}
        {isSortable && <IconSortHeader sort={sort} className={isActive ? "fill-white" : "fill-subtitle"} />}
      </div>
    </div>
  )
}

export const ListHeader = ({ headers, activeSort, onSort, rowDisposition: CustomRowDisposition = ListRowDisposition }: ListHeaderProps) => {
  return (
    <div className="relative hidden w-full xl:block">
      <div className={`w-full rounded-t-[10px] bg-overlay-panel px-4 py-[6.5px] leading-[10px] backdrop-blur-[60px]`}>
        <CustomRowDisposition>
          {!!headers[0]?.key && (
            <HeaderDisplay
              key={headers[0]?.key}
              label={headers[0]?.label}
              sort={(activeSort?.key == headers[0]?.key && activeSort?.direction) || "none"}
              field={headers[0]?.key || ""}
              onSort={!!headers[0]?.sort ? onSort : undefined}
              indicator={headers[0]?.indicator}
              className="flex w-full items-center justify-start pl-8"
            />
          )}
          {!!headers[1]?.key && (
            <HeaderDisplay
              key={headers[1]?.key}
              label={headers[1]?.label}
              sort={(activeSort?.key == headers[1]?.key && activeSort?.direction) || "none"}
              field={headers[1]?.key || ""}
              onSort={!!headers[1]?.sort ? onSort : undefined}
              indicator={headers[1]?.indicator}
              className="flex w-full items-center justify-center"
            />
          )}
          <>
            {headers
              ?.slice(2)
              ?.map((header) => (
                <HeaderDisplay
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
