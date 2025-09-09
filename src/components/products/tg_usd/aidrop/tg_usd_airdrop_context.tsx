"use client"

import { ListState } from "@/types"
import { getUserTasks } from "../api"
import { UserTask } from "../tg_usd_type"
import { useTgUsdContext } from "../tg_usd_context"
import { mapAirdropData } from "./tg_usd_airdrop_controller"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"

type TgUsdAirdropContextProps = {
  children: ReactNode
}

type TgUsdAirdropContextValues = {
  tasks: UserTask[]
  displayRows: UserTask[]
  customSort: (arg: ListState) => void
}

export const TgUsdAirdropContext = createContext<TgUsdAirdropContextValues | undefined>(undefined)

export const TgUsdAirdropProvider = ({ children }: TgUsdAirdropContextProps) => {
  const { currentAddress } = useWalletConnexionContext()

  const { refetchPoints } = useTgUsdContext()

  const [tasks, setTasks] = useState<UserTask[]>([])

  useEffect(() => {
    if (currentAddress) {
      getUserTasks(currentAddress).then((userTasks) => {
        setTasks(userTasks)
      })

      refetchPoints()
    }
  }, [currentAddress])

  const displayRows = useMemo(() => {
    if (!tasks) return []

    const rows = mapAirdropData(tasks)

    return rows
  }, [tasks])

  const customSort = (listState: ListState) => {
    const { key, direction } = listState.sort!

    displayRows.sort((elementA: UserTask, elementB: UserTask) => {
      const aValue = elementA[key as keyof UserTask]
      const bValue = elementB[key as keyof UserTask]

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1

      return 0
    })
  }

  const contextValue: TgUsdAirdropContextValues = {
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
