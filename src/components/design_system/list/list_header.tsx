"use client"

import USGHoverCard from "../structure/usg_hover_card"
import { ListHeaderData, ListSort, SortedState } from "@/types"
import { IconSortHeader } from "@/components/icons/icon_sort_header"
import ListRowDisposition from "@/components/design_system/list/list_row_disposition"

interface ListHeaderProps {
  headers: ListHeaderData[]
  className?: string
  activeSort?: ListSort
  onSort?: (key: string) => void
  indicator?: string
  rowDisposition?: React.ComponentType<{ children: React.ReactNode[] }> // Simplified custom disposition component
}

interface HeaderDisplayProps {
  label?: string
  sort: SortedState
  onSort?: (key: string) => void
  field: string
  indicator?: string
}

const HeaderDisplay = ({ label, sort = "none", onSort, field, indicator }: HeaderDisplayProps) => {
  return (
    <div className="flex w-full flex-1 items-center justify-center gap-2" onClick={() => onSort && onSort(field)}>
      <span>{label} </span>
      {indicator && <USGHoverCard title={label as string}>{indicator}</USGHoverCard>}
      <div className="text-row-tonic">{label && label !== "" && <IconSortHeader sort={sort} />}</div>
    </div>
  )
}

const ListHeader = ({ headers, className = "", activeSort, onSort, rowDisposition: CustomRowDisposition = ListRowDisposition }: ListHeaderProps) => {
  return (
    <div className={`hidden p-4 leading-[10px] xl:block ${className}`}>
      <CustomRowDisposition>
        {!!headers?.at(0)?.key && (
          <HeaderDisplay
            key={headers?.at(0)?.key}
            label={headers?.at(0)?.label}
            sort={(activeSort?.key == headers?.at(0)?.key && activeSort?.direction) || "none"}
            field={headers?.at(0)?.key || ""}
            onSort={onSort}
            indicator={headers?.at(0)?.indicator}
          />
        )}
        {!!headers?.at(1)?.key && (
          <HeaderDisplay
            key={headers?.at(1)?.key}
            label={headers?.at(1)?.label}
            sort={(activeSort?.key == headers?.at(1)?.key && activeSort?.direction) || "none"}
            field={headers?.at(1)?.key || ""}
            onSort={onSort}
            indicator={headers?.at(1)?.indicator}
          />
        )}
        <>
          {headers?.slice(2)?.map((header) => (
            <HeaderDisplay
              key={header.key}
              label={header.label}
              sort={(activeSort?.key == header.key && activeSort?.direction) || "none"}
              field={header.key}
              onSort={onSort}
              indicator={header.indicator}
            />
          ))}
        </>
      </CustomRowDisposition>
    </div>
  )
}

export default ListHeader
