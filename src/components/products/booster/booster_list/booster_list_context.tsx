"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { getBoosterListData, transformBoosterList } from "./booster_list_controller"
import { BoosterExistingAsset, OutputBoosterList } from "../booster_type"
import { getBoosterApr } from "../booster_controller"
import { AssetApr, AssetDataPriced, ListRowData } from "@/types"

type BoosterListProps = {
  children: ReactNode
  infos: [AssetDataPriced, AssetDataPriced, AssetDataPriced, AssetDataPriced]
}

type BoosterListContextValues = {
  displayRows?: ListRowData[]
  isLoading: boolean
}

export const BoosterListContext = createContext<BoosterListContextValues | undefined>(undefined)

export const BoosterListProvider = ({ children, infos }: BoosterListProps) => {
  const [balInfo, crvInfo, fxnInfo, pendleInfo] = infos

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [rows, setRows] = useState<OutputBoosterList | undefined>()
  const [aprs, setAprs] = useState<Record<BoosterExistingAsset, AssetApr> | undefined>()

  useEffect(() => {
    loadData()
    loadApr()
  }, [])

  const loadApr = useCallback(() => {
    getBoosterApr().then(setAprs)
  }, [])

  const displayRows = useMemo(() => {
    return transformBoosterList(rows, aprs, [balInfo, crvInfo, fxnInfo, pendleInfo])
  }, [rows, aprs])

  const loadData = useCallback(() => {
    setIsLoading(true)
    getBoosterListData().then((data) => {
      setRows(data)
      setIsLoading(false)
    })
  }, [])

  const contextValue: BoosterListContextValues = {
    displayRows,
    isLoading,
  }

  return <BoosterListContext.Provider value={contextValue}>{children}</BoosterListContext.Provider>
}

export const useBoosterListContext = () => {
  const context = useContext(BoosterListContext)
  if (!context) {
    throw new Error("useBoosterListContext must be used within a BoosterListProvider")
  }
  return context
}
