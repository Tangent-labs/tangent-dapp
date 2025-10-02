"use client"

import USGHoverCard from "../structure/usg_hover_card"
import { ListHeaderData, ListSort, SortedState } from "@/types"
import { IconSortHeader } from "@/components/icons/icon_sort_header"
import ListRowDisposition from "@/components/design_system/list/list_row_disposition"
import { cn } from "@/lib/utils"

interface ListHeaderProps {
  headers: ListHeaderData[]
  className?: string
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
  return (
    <div className={cn(className, "cursor-pointer gap-2 text-sm")} onClick={() => onSort && onSort(field)}>
      <span>{label}</span>
      {indicator && (
        <USGHoverCard iconClassName="w-[13px]" title={label as string}>
          {indicator}
        </USGHoverCard>
      )}
      {!!onSort && <IconSortHeader sort={sort} />}
    </div>
  )
}

const ListHeader = ({ headers, className = "", activeSort, onSort, rowDisposition: CustomRowDisposition = ListRowDisposition }: ListHeaderProps) => {
  return (
    <div className={`hidden px-4 py-2 leading-[10px] xl:block ${className}`}>
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
          {headers?.slice(2)?.map((header) => (
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
  )
}

export default ListHeader
