"use client"
import React, { createContext, useContext, useState, ReactNode, useMemo } from "react"
import { ListHeaderData, ListRowData, ListSort, ListState } from "@/types"

//  Defined what is injected into the Provider ( mosty via server execution)
interface ListProviderProps {
  _listState: ListState
  _rows: ListRowData[]
  _headers: ListHeaderData[]
  children: ReactNode
}

// Define what is returned by the provider
interface ListContextValues {
  listState: ListState
  displayRows: ListRowData[]
  headers: ListHeaderData[]
  udpateSort: (field: string) => void
  udpateSearch: (search: string) => void
}

// Create the context
const ListContext = createContext<ListContextValues | undefined>(undefined)

// Create a provider component
export const ListProvider = ({ children, _listState, _rows, _headers }: ListProviderProps) => {
  const [listState, setListState] = useState<ListState>(_listState)
  const [headers] = useState<ListHeaderData[]>(_headers)

  const displayRows = useMemo(() => {
    let activeRows = _rows ? (JSON.parse(JSON.stringify(_rows)) as ListRowData[]) : []
    if (listState?.search) {
      activeRows = activeRows.filter((r) => r.name.toLowerCase().includes(listState.search!.toLowerCase()))
    }
    if (listState?.sort?.key) {
      //Let's sort IT
    }
    return activeRows
  }, [listState])

  const udpateSort = (field: string) => {
    const newSort = { ...listState.sort } as ListSort
    //console.log("udpateSort", field)

    if (newSort.key === field) {
      newSort.direction = newSort.direction === "asc" ? "desc" : "asc"
    } else {
      newSort.key = field
      newSort.direction = "asc"
    }
    setListState({ ...listState, sort: newSort })
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
