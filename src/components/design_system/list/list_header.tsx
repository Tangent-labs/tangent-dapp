"use client"

import { ListHeaderData, ListSort, SortedState } from "@/types"
import ListRowDisposition from "@/components/design_system/list/list_row_disposition"
import { IconSortHeader } from "@/components/icons/icon_sort_header"

interface ListHeaderProps {
  headers: ListHeaderData[]
  className?: string
  activeSort?: ListSort
  onSort?: (key: string) => void
  rowDisposition?: React.ComponentType<{ children: React.ReactNode[] }> // Simplified custom disposition component
}

interface HeaderDisplayProps {
  label?: string
  sort: SortedState
  onSort?: (key: string) => void
  field: string
}

const HeaderDisplay = ({ label, sort = "none", onSort, field }: HeaderDisplayProps) => {
  return (
    <div className="flex-1">
      <button className="flex w-full justify-center gap-2" type="button" onClick={() => onSort && onSort(field)}>
        <span>{label} </span>
        <div className="text-row-tonic">
          <IconSortHeader sort={sort} />
        </div>
      </button>
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
          />
        )}
        {!!headers?.at(1)?.key && (
          <HeaderDisplay
            key={headers?.at(1)?.key}
            label={headers?.at(1)?.label}
            sort={(activeSort?.key == headers?.at(1)?.key && activeSort?.direction) || "none"}
            field={headers?.at(1)?.key || ""}
            onSort={onSort}
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
                onSort={onSort}
              />
            ))}
        </>
      </CustomRowDisposition>
    </div>
  )
}

export default ListHeader
