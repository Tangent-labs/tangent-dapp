"use client"

import { ListState } from "@/types"
import { useUSGContext } from "../../tg_usd_context"
import { UserTask, VoteTask } from "../../tg_usd_type"
import { getUserTasks, getUserVoteTasks } from "../../api"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { mapAirdropData } from "./usg_tasks_controller"

type UsgTasksContextProps = {
  children: ReactNode
}

type UsgTasksContextValues = {
  tasks: UserTask[]
  lpTasks: UserTask[]
  voteTasks: VoteTask[]
  sortLpTasks: (arg: ListState) => void
  sortVoteTasks: (arg: ListState) => void
  selectedFeature: "Borrow & LP" | "Vote"
  setSelectedFeature: (t: "Borrow & LP" | "Vote") => void
}

export const UsgTasksContext = createContext<UsgTasksContextValues | undefined>(undefined)

export const UsgTasksProvider = ({ children }: UsgTasksContextProps) => {
  const { currentAddress } = useWalletConnexionContext()

  const { refetchPoints } = useUSGContext()

  const [tasks, setTasks] = useState<UserTask[]>([])

  const [voteTasks, setVoteTasks] = useState<VoteTask[]>([])

  const [selectedFeature, setSelectedFeature] = useState<"Borrow & LP" | "Vote">("Borrow & LP")

  useEffect(() => {
    if (currentAddress) {
      getUserTasks(currentAddress).then((tasks) => {
        setTasks(tasks)
      })

      getUserVoteTasks(currentAddress).then((tasks) => {
        setVoteTasks(tasks)
      })

      refetchPoints()
    }
  }, [currentAddress])

  const lpTasks = useMemo(() => {
    if (!tasks) return []

    const rows = mapAirdropData(tasks)

    return rows
  }, [tasks])

  const sortVoteTasks = (listState: ListState) => {
    const { key, direction } = listState.sort!

    voteTasks.sort((elementA: VoteTask, elementB: VoteTask) => {
      const aValue = elementA[key as keyof VoteTask]
      const bValue = elementB[key as keyof VoteTask]

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1

      return 0
    })
  }

  const sortLpTasks = (listState: ListState) => {
    const { key, direction } = listState.sort!

    lpTasks.sort((elementA: UserTask, elementB: UserTask) => {
      const aValue = elementA[key as keyof UserTask]
      const bValue = elementB[key as keyof UserTask]

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1

      return 0
    })
  }

  const contextValue: UsgTasksContextValues = {
    tasks,
    lpTasks,
    voteTasks,
    sortLpTasks,
    sortVoteTasks,
    selectedFeature,
    setSelectedFeature,
  }

  return <UsgTasksContext.Provider value={contextValue}>{children}</UsgTasksContext.Provider>
}

export const useUsgTasksContext = () => {
  const context = useContext(UsgTasksContext)
  if (!context) {
    throw new Error("useUsgTasksContext must be used within a UsgTasksProvider")
  }
  return context
}
