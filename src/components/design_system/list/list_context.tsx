"use client"

import { ListHeaderData, ListRowData, ListSort, ListState } from "@/types"
import React, { createContext, useContext, useState, ReactNode, useMemo } from "react"
import { Boost, ClaimData, AprOpportunityItem, HarvesterInfoDisplay, UserPosition, VoteTask, LpTask } from "@/components/products/usg/usg_type"

export type SortedRows = ListRowData[] | ClaimData[] | LpTask[] | VoteTask[] | UserPosition[] | AprOpportunityItem[] | Boost[] | HarvesterInfoDisplay[]

//  Defined what is injected into the Provider ( mosty via server execution)
interface ListProviderProps {
  _listState: ListState
  _rows: ListRowData[] | ClaimData[] | LpTask[] | VoteTask[] | UserPosition[] | AprOpportunityItem[] | Boost[] | HarvesterInfoDisplay[]
  _headers: ListHeaderData[]
  children: ReactNode
  // Legacy hook kept for list implementations that apply sorting through external state mutations.
  customSort?: (arg: ListState) => void
  // Pure hook for list implementations that want to customize how the internal list state sorts displayed rows.
  getSortedRows?: (rows: SortedRows, arg: ListState) => SortedRows
}

// Define what is returned by the provider
interface ListContextValues {
  listState: ListState
  displayRows: ListRowData[] | ClaimData[] | LpTask[] | VoteTask[] | UserPosition[] | AprOpportunityItem[] | Boost[] | HarvesterInfoDisplay[]
  headers: ListHeaderData[]
  udpateSort: (field: string) => void
  udpateSearch: (search: string) => void
}

// Create the context
const ListContext = createContext<ListContextValues | undefined>(undefined)

// Create a provider component
export const ListProvider = ({ children, _listState, _rows, _headers, customSort, getSortedRows }: ListProviderProps) => {
  const [listState, setListState] = useState<ListState>(_listState)
  const [headers] = useState<ListHeaderData[]>(_headers)

  const displayRows = useMemo(() => {
    const activeRows = _rows ? JSON.parse(JSON.stringify(_rows)) : []

    if (listState?.search) {
      // Implement search
      // activeRows = activeRows.filter((r) => r.name.toLowerCase().includes(listState.search!.toLowerCase()))
    }
    if (listState?.sort?.key) {
      if (getSortedRows) {
        return getSortedRows(activeRows, listState)
      }
    }
    return activeRows
  }, [listState, _rows, getSortedRows])

  const udpateSort = (field: string) => {
    const newSort = { ...listState.sort } as ListSort

    if (newSort.key === field) {
      newSort.direction = newSort.direction === "asc" ? "desc" : "asc"
    } else {
      newSort.key = field
      newSort.direction = "desc"
    }

    setListState({ ...listState, sort: newSort })
    if (customSort) {
      // Preserve the previous contract where sorting is handled outside the provider.
      customSort({ ...listState, sort: newSort })
    }
  }

  const udpateSearch = (search?: string) => {
    if (listState.search === search) return
    setListState({ ...listState, search: search })
  }
  const contextValue: ListContextValues = {
    listState,
    displayRows,
    headers,
    udpateSort,
    udpateSearch,
  }

  return <ListContext.Provider value={contextValue}>{children}</ListContext.Provider>
}

// Create a custom hook for consuming the context
export const useListContext = () => {
  const context = useContext(ListContext)
  if (!context) {
    throw new Error("useListContext must be used within a ListProvider")
  }
  return context
}
