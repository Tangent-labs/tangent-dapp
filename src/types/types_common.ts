import { ReactNode } from "react"

export type IndicatorData = { title: string; value: string | number }

export type FeaturesData = {
  key: string
  label?: string
  isGlobal: boolean
}

export type ProductData = {
  name: string
  url: string
  header: ReactNode
  key: string
  features: FeaturesData[]
  defaultFeature: FeaturesData["key"]
}
