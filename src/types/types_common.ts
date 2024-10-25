import { ReactNode } from "react"

export type IndicatorData = { title: string; value: string | number }

export type FeaturesData = {
  key: string
  label?: string
  isGlobal: boolean
}

export type ProductKey = "splitter" | "booster" | "wrapper"

export type ProductData = {
  name: string
  url: string
  header: ReactNode
  key: ProductKey
  features: FeaturesData[]
  defaultFeature: FeaturesData["key"]
}
