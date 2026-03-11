"use client"

import { ListState } from "@/types"
import { Address, formatEther } from "viem"
import { useUSGContext } from "../../usg_context"
import { USGMarkets } from "../../usg_repository"
import { UserTask, VoteTask } from "../../usg_type"
import { getUserTasks, getUserVoteTasks } from "../../client_api"
import { getUserBalancesAndDebtForLpTasks, mapAirdropData, mapVoteTasksProtocol } from "./usg_tasks_controller"
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

type UsgTasksContextProps = {
  children: ReactNode
}

type UsgTasksContextValues = {
  lpTasks: UserTask[]

  voteTasks: VoteTask[]
  sortLpTasks: (arg: ListState) => void
  sortVoteTasks: (arg: ListState) => void
  selectedFeature: string
  setSelectedFeature: (s: string) => void

  lpTaskSearchValue: string | null
  setLpTaskSearchValue: (value: string | null) => void

  lpTaskFilteredBy: string
  setLpTaskFilteredBy: (s: string) => void

  voteTaskSearchValue: string | null
  setVoteTaskSearchValue: (value: string | null) => void

  lpTaskProtocol: string
  setLpTaskProtocol: (s: string) => void

  voteTaskProtocol: string
  setVoteTaskProtocol: (s: string) => void
}

export const UsgTasksContext = createContext<UsgTasksContextValues | undefined>(undefined)

export const UsgTasksProvider = ({ children }: UsgTasksContextProps) => {
  const { currentAddress } = useWalletConnexionContext()

  const { refetchPoints } = useUSGContext()

  const [tasks, setTasks] = useState<UserTask[]>([])

  const [rawVoteTasks, setRawVoteTasks] = useState<VoteTask[]>([])

  const [selectedFeature, setSelectedFeature] = useState<string>("Borrow & LP")

  const [lpTaskSearchValue, setLpTaskSearchValue] = useState<string | null>(null)

  const [lpTaskFilteredBy, setLpTaskFilteredBy] = useState<string>("All")

  const [voteTaskSearchValue, setVoteTaskSearchValue] = useState<string | null>(null)

  const [lpTaskProtocol, setLpTaskProtocol] = useState<string>("All")

  const [voteTaskProtocol, setVoteTaskProtocol] = useState<string>("All")

  useEffect(() => {
    if (currentAddress) {
      getUserTasks(currentAddress).then((rawLpTasks) => {
        setTasks(rawLpTasks)
      })

      getUserVoteTasks(currentAddress).then((t) => {
        setRawVoteTasks(t)
      })

      refetchPoints()
    }
  }, [currentAddress])

  useEffect(() => {
    if (tasks.length !== 0) {
      const tokens = tasks.map((t) => t.tokenAddress) as Address[]
      // Fetch current balance on the LP tasks
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

          tasksCopy[0].status = tasksCopy[0].balanceUsd > 0.1

          for (let i = 1; i < tasksCopy.length; i++) {
            const t = tasksCopy[i]
            t.balance = Number(formatEther(balances[i - 1]))
            t.balanceUsd = t.balance * t.priceUSD
            t.status = t.balanceUsd > 0.1
          }
          setTasks(tasksCopy)
        }
      })
    }
  }, [tasks.length])

  const voteTasks = useMemo(() => {
    if (!rawVoteTasks) return []

    const rows = rawVoteTasks

    let rowsToShow = rows.filter((row) => voteTaskProtocol === "All" || mapVoteTasksProtocol(row.protocol) === voteTaskProtocol)

    if (voteTaskSearchValue?.trim()) {
      const lowered = voteTaskSearchValue.toLowerCase().trim()
      rowsToShow = rowsToShow.filter((row) => row?.description?.toLowerCase().includes(lowered))
    }

    return rowsToShow
  }, [rawVoteTasks, voteTaskSearchValue, voteTaskProtocol])

  const lpTasks = useMemo(() => {
    if (!tasks) return []

    const rows = mapAirdropData(tasks)

    let rowsToShow = rows
      .filter((row) => lpTaskFilteredBy === "All" || (row?.balance ?? 0) > 0)
      .filter((row) => lpTaskProtocol === "All" || row.protocol?.replaceAll(" ", "") === lpTaskProtocol?.replaceAll(" ", ""))

    if (lpTaskSearchValue?.trim()) {
      const lowered = lpTaskSearchValue.toLowerCase().trim()
      rowsToShow = rowsToShow.filter((row) => row?.description?.toLowerCase().includes(lowered))
    }

    return rowsToShow
  }, [tasks, lpTaskSearchValue, lpTaskFilteredBy, lpTaskProtocol])

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
      const aValue = elementA[key as keyof UserTask]!
      const bValue = elementB[key as keyof UserTask]!

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1

      return 0
    })
  }

  const contextValue: UsgTasksContextValues = {
    lpTasks,

    voteTasks,

    sortLpTasks,
    sortVoteTasks,

    selectedFeature,
    setSelectedFeature,

    lpTaskSearchValue,
    setLpTaskSearchValue,

    lpTaskFilteredBy,
    setLpTaskFilteredBy,

    voteTaskSearchValue,
    setVoteTaskSearchValue,

    lpTaskProtocol,
    voteTaskProtocol,

    setLpTaskProtocol,
    setVoteTaskProtocol,
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
