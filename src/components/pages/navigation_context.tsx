"use client"
import { FeaturesData, ProductData, ProductKey } from "@/types"
import { useRouter } from "next/navigation"
import React, { createContext, useContext, useState, ReactNode, useMemo } from "react"
import { productsData } from "../products"

/** !!! if needed _globalFeatures & _defautFeatures can be personalized for each product  */

//  Defined what is injected into the Provider ( mosty via server execution)
interface NavigationProviderProps {
  children: ReactNode
  _currentProduct: ProductKey
  _currentFeature: string
  _currentItem?: string
}

type NavigateParams = {
  productTo: ProductKey
  featureTo: string
  itemSlug?: string
}

// Define what is returned by the provider
interface NavigationContextValues {
  currentProduct: ProductKey
  currentFeature: string
  currentItem?: string
  currentProductData: ProductData
  currentFeatureData: FeaturesData
  navigate: ({ productTo, featureTo, itemSlug }: NavigateParams) => void
  getLink: ({ productTo, featureTo, itemSlug }: NavigateParams) => string
  getFeatureData: (feature: string) => FeaturesData
}

// Create the context
const NavigationContext = createContext<NavigationContextValues | undefined>(undefined)

// Create a provider component
export const NavigationProvider = ({ children, _currentProduct, _currentFeature, _currentItem }: NavigationProviderProps) => {
  const [currentProduct, setCurrentProduct] = useState<ProductKey>(_currentProduct)
  const [currentFeature, setCurrentFeature] = useState<string>(_currentFeature)
  const [currentItem, setcurrentItem] = useState<string | undefined>(_currentItem)
  const router = useRouter()

  const currentProductData = useMemo(() => {
    return productsData[currentProduct]
  }, [currentProduct])

  const getFeatureData = (feature: string) => {
    const data = productsData[currentProduct]?.features?.find((f) => f.key === feature)
    return data || { key: "list", isGlobal: true }
  }
  const currentFeatureData = useMemo(() => {
    return getFeatureData(currentFeature)
  }, [currentProduct, currentFeature])

  const getLink = ({ productTo, featureTo, itemSlug }: NavigateParams) => {
    const data = productsData[productTo]
    const featureToData = data.features.find((a) => a.key === featureTo)
    let url = `/${data.url}`
    if (featureToData?.isGlobal) {
      if (featureTo !== "list") {
        url = `${url}/${featureTo}`
      }
    } else {
      url = `${url}/${itemSlug}`
      if (featureTo !== data.defaultFeature) {
        url = `${url}/${featureTo}`
      }
    }
    return url
  }

  const navigate = ({ productTo, featureTo, itemSlug }: NavigateParams) => {
    const data = productsData[productTo]
    const featureToData = data.features.find((a) => a.key === featureTo)
    setCurrentFeature(featureTo)

    if (productTo !== currentProduct) setCurrentProduct(productTo)
    itemSlug = featureToData?.isGlobal ? undefined : itemSlug
    if (currentItem !== itemSlug) setcurrentItem(itemSlug)
    const url = getLink({ productTo, featureTo, itemSlug })
    router.push(url)
  }

  const contextValue: NavigationContextValues = {
    currentProduct,
    currentFeature,
    currentItem,
    currentProductData,
    currentFeatureData,
    navigate,
    getLink,
    getFeatureData,
  }

  return <NavigationContext.Provider value={contextValue}>{children}</NavigationContext.Provider>
}

// Create a custom hook for consuming the context
export const useNavigationContext = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigationContext must be used within a NavigationProvider")
  }
  return context
}
