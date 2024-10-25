"use client"
import type { FormState } from "@/types"

import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import {
  ExampleFormAssetData,
  ExampleFormAssetOption,
  ExampleFormContextValue,
  ExampleFormContractData,
  ExampleFormSetUpData,
  ExampleFormValues,
  ExampleFormValueTypes,
  FormExampleValueField,
} from "./example_form_type"
import { getDefaultValues, getSetUpData, doApprove, doDeposit, getFormState } from "./example_form_controller"

// Create the context
export const exampleFormContext = createContext<ExampleFormContextValue>(undefined!)

type ExampleFormProviderProps = {
  children: ReactNode
  contract: ExampleFormContractData
  assetList: ExampleFormAssetData[]
  assetOptions: ExampleFormAssetOption
}

// Create a provider component
export const ExampleFormProvider = ({ children, assetList, assetOptions, contract }: ExampleFormProviderProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [setUpData, setSetUpData] = useState<ExampleFormSetUpData | undefined>()
  const [formValues, setFormValues] = useState<ExampleFormValues>(getDefaultValues(assetList))

  /**
   * Load data on Load
   */
  useEffect(() => loadSetUpData(), [])

  /**
   * Handle the change in data when Asset is updated
   */
  const currentAsset = useMemo(() => {
    const asset = assetList!.find((a) => a.assetType === formValues.assetIn)
    const walletInfo = setUpData?.assets[formValues.assetIn]
    return {
      ...asset!,
      ...walletInfo,
    }
  }, [formValues?.assetIn])

  /**
   * Handle the buttons state
   */
  const formState = useMemo<FormState>(() => getFormState(currentAsset, formValues, true), [currentAsset, formValues.value])

  /**
   * Reload data on load or after an action
   */
  const loadSetUpData = useCallback(() => {
    setIsLoading(true)
    getSetUpData().then((data) => {
      setSetUpData(data)
      // we select the firt position if no selection
      if (formValues && !formValues?.selectedPosition) {
        updateFormValues("selectedPosition", data.positionsOptions?.at(0)?.value)
      }
      setIsLoading(false)
    })
  }, [])

  const updateFormValues = (field: FormExampleValueField, value: ExampleFormValueTypes) => {
    const newAssign = { [field]: value }
    const newValues = {
      ...formValues,
      ...newAssign,
    }
    setFormValues(newValues)
  }

  const actionDeposit = async () => {
    doDeposit(contract.address, formValues.assetIn, formValues.value, Number(formValues.selectedPosition) || -1).then(loadSetUpData)
  }
  const actionApprove = async () => {
    doApprove(currentAsset.address, currentAsset.approveContract!).then(loadSetUpData)
  }

  const contextValue = {
    isLoading,
    formState,
    currentAsset,
    setUpData,
    assetOptions,
    formValues,
    updateFormValues,
    actionDeposit,
    actionApprove,
  }

  return <exampleFormContext.Provider value={contextValue}>{children}</exampleFormContext.Provider>
}
