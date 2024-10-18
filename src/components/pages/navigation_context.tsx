"use client"
import { ProductBaseFeature, ProductData, ProductKey } from "@/types"
import { useRouter } from "next/navigation"
import React, { createContext, useContext, useState, ReactNode, useMemo } from "react"
import { productsData } from "../products"

/** claim & List are global feature they do not required a item to be selected */
const _globalFeatures = ["list", "claim"]

/** defautFeatures are not present in the URL  */
const _defautFeatures = {
  global: "list",
  item: "deposit",
}

/** !!! if needed _globalFeatures & _defautFeatures can be personalized for each product  */

//  Defined what is injected into the Provider ( mosty via server execution)
interface NavigationProviderProps {
  children: ReactNode
  _currentProduct: ProductKey
  _currentFeature: ProductBaseFeature
  _currentItem?: string
}

type NavigateParams = {
  productTo: ProductKey
  featureTo: ProductBaseFeature
  itemSlug?: string
}

// Define what is returned by the provider
interface NavigationContextValues {
  currentProduct: ProductKey
  currentFeature: ProductBaseFeature
  currentItem?: string
  getCurrentProductData: ProductData
  navigate: ({ productTo, featureTo, itemSlug }: NavigateParams) => void
  getLink: ({ productTo, featureTo, itemSlug }: NavigateParams) => string
}

// Create the context
const NavigationContext = createContext<NavigationContextValues | undefined>(undefined)

// Create a provider component
export const NavigationProvider = ({ children, _currentProduct, _currentFeature, _currentItem }: NavigationProviderProps) => {
  /**
   *  claim & List are globalk feature do not  required a item to be selected
   *
   */

  const [currentProduct, setCurrentProduct] = useState<ProductKey>(_currentProduct)
  const [currentFeature, setCurrentFeature] = useState<ProductBaseFeature>(_currentFeature)
  const [currentItem, setcurrentItem] = useState<string | undefined>(_currentItem)
  const router = useRouter()

  const getCurrentProductData = useMemo(() => {
    return productsData[currentProduct]
  }, [currentProduct])

  const getLink = ({ productTo, featureTo, itemSlug }: NavigateParams) => {
    const data = productsData[productTo]
    let url = `/${data.url}`
    if (_globalFeatures.includes(featureTo)) {
      if (featureTo !== _defautFeatures.global) {
        url = `${url}/${featureTo}`
      }
    } else {
      url = `${url}/${itemSlug}`
      if (featureTo !== _defautFeatures.item) {
        url = `${url}/${featureTo}`
      }
    }
    return url
  }

  const navigate = ({ productTo, featureTo, itemSlug }: NavigateParams) => {
    setCurrentFeature(featureTo)
    if (productTo !== currentProduct) setCurrentProduct(productTo)
    itemSlug = _globalFeatures.includes(featureTo) ? undefined : itemSlug
    if (currentItem !== itemSlug) setcurrentItem(itemSlug)
    const url = getLink({ productTo, featureTo, itemSlug })
    router.push(url)
  }

  const contextValue: NavigationContextValues = {
    currentProduct,
    currentFeature,
    getCurrentProductData,
    currentItem,
    navigate,
    getLink,
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
