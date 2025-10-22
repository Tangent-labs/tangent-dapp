"use client"

import { ListState } from "@/types"
import { useUSGContext } from "../../tg_usd_context"
import { UserTask, VoteTask } from "../../tg_usd_type"
import { getUserTasks, getUserVoteTasks } from "../../api"
import { useWalletConnexionContext } from "../../../wallet/wallet_connexion_context"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { getUserBalancesAndDebtForLpTasks, mapAirdropData } from "./usg_tasks_controller"
import { USGMarkets } from "../../tg_usd_repository"
import { Address, formatEther } from "viem"

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

  useEffect(() => {
    if (tasks.length !== 0) {
      const tokens = tasks.map((t) => t.tokenAddress) as Address[]
      getUserBalancesAndDebtForLpTasks(
        currentAddress as Address,
        USGMarkets.map((m) => m.marketAddress),
        tokens.slice(1) // Remove the first element as there is no tokens on the first task
      ).then((balances) => {
        if (balances) {
          const tasksCopy = [...tasks]

          // Aggregation of all debt from all markets is on the last element of the array returned by the chainview
          const debt = balances[balances.length - 1]
          // The debt task is always the one with id = 0
          tasksCopy[0].balance = Number(formatEther(debt))
          // The price of USD is in the task at the index 1 as it's the task to hold USG
          tasksCopy[0].balanceUsd = tasksCopy[0].balance * tasksCopy[1].priceUSD

          for (let i = 1; i < tasksCopy.length; i++) {
            const t = tasksCopy[i]
            t.balance = Number(formatEther(balances[i - 1]))
            t.balanceUsd = t.balance * t.priceUSD
          }
          setTasks(tasksCopy)
        }
      })
    }
  }, [tasks.length])

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
      if (!aValue) return 1
      if (!bValue) return 1

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
