"use client"

import { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { AirdropTask } from "../tg_usd_type"
import { mapAirdropData } from "./tg_usd_airdrop_controller"
import { ListState } from "@/types"

type TgUsdAirdropContextProps = {
  children: ReactNode
  tasks: AirdropTask[]
}

type TgUsdAirdropContextValues = {
  isLoading: boolean
  tasks: AirdropTask[]
  displayRows: AirdropTask[]
  customSort: (arg: ListState) => void
}

export const TgUsdAirdropContext = createContext<TgUsdAirdropContextValues | undefined>(undefined)

export const TgUsdAirdropProvider = ({ children, tasks }: TgUsdAirdropContextProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const displayRows = useMemo(() => {
    if (!tasks) return []
    const rows = mapAirdropData(tasks)
    setIsLoading(false)

    return rows
  }, [tasks])

  const customSort = (listState: ListState) => {
    const { key, direction } = listState.sort!

    displayRows.sort((elementA: AirdropTask, elementB: AirdropTask) => {
      const aValue = elementA[key as keyof AirdropTask]
      const bValue = elementB[key as keyof AirdropTask]

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1

      return 0
    })
  }

  const contextValue: TgUsdAirdropContextValues = {
    isLoading,
    tasks,
    displayRows,
    customSort,
  }

  return <TgUsdAirdropContext.Provider value={contextValue}>{children}</TgUsdAirdropContext.Provider>
}

export const useTgUsdAirdropContext = () => {
  const context = useContext(TgUsdAirdropContext)
  if (!context) {
    throw new Error("useTgUsdAirdropContext must be used within a TgUsdAirdropProvider")
  }
  return context
}
