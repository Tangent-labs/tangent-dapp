import { ReactNode } from "react"

export type IndicatorData = { title: string; value: string | number }

export type ProductKey = "splitter" | "booster" | "wrapper"
export type ProductBaseFeature = "list" | "deposit" | "claim" | "withdraw"
export type ProductData = {
  name: string
  url: string
  header: ReactNode
  key: ProductKey
}
