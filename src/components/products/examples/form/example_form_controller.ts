import { getAssetInfo } from "@/services/service_existing_asset"
import {
  ExampleFormAssetData,
  ExampleFormAssetOption,
  ExampleFormAssetType,
  ExampleFormValues,
  ExampleFormChainViewData,
  ExampleFormSetUpData,
  ExampleFormInitData,
} from "@/components/products/examples/form/example_form_type"
import { Address } from "viem"
import { AssetUserData, SelectOption, TokenizedPosition } from "@/types"

/**
 *
 * methods conventions :
 *      _xxx : internal not exported method
 *      get(XxxxYyyy) => fetch data from a repo|api|chain or createData
 *      transform(XxxxYyyy) => get a dataType a transform it to another dataType
 *      do(XxxxYyyy) = perform chain|api action
 *
 *      ps: get & transform  process should be split in two methods
 */

export const getFormExampleInitData = async () => {
  // Mock up function representing the server initial data
  const paramsList: Record<string, ExampleFormAssetType> = {
    USDC: "asset",
    CRV: "sdAsset",
    CVX: "gaugeAsset",
  }
  const assetList = await getAssetInfo(Object.keys(paramsList))
  return {
    assetList: assetList.map((a, index) => {
      return {
        ...a,
        assetType: paramsList[a.symbol],
        approveContract: index === 0 ? undefined : "0x122",
      } as ExampleFormAssetData
    }),
    contract: {
      address: "0x5558",
      name: "sdCRV",
    },
  } as ExampleFormInitData
}

export function getDefaultValues(assetList: ExampleFormAssetData[]): ExampleFormValues {
  return {
    value: BigInt(0),
    assetIn: assetList!.at(0)!.assetType,
    selectedPosition: undefined,
  }
}

export function transformAssetToOptions(assetList: ExampleFormAssetData[]): ExampleFormAssetOption {
  return {
    options: assetList!.map((a) => a.logo!) || [],
    optionValues: assetList.reduce<Record<string, string>>((agg, item, index) => {
      agg[item.logo || index.toString()] = item.assetType
      return agg
    }, {}),
  }
}

export async function getSetUpData(_account?: Address) {
  const data = await _getFormExampleChainData(_account)
  return _transformToSetUpData(data)
}

async function _getFormExampleChainData(_account?: Address) {
  // Mock up function representing a chainView result
  const factor18 = 10n ** 18n
  const factor6 = 10n ** 6n
  console.info(_account)
  return new Promise<ExampleFormChainViewData>((resolve) => {
    resolve({
      erc20Data: [
        { balance: 5000n * factor6, allowance: 10000n * factor6 },
        { balance: 1000n * factor18, allowance: 2000n * factor18 },
        { balance: 3000n * factor18, allowance: 6000n * factor18 },
      ],
      userData: {
        positions: [
          { tknId: 1, balance: 1000n ** 18n },
          { tknId: 2, balance: 2000n ** 18n },
        ],
      },
    })
  })
}

function _transformToSetUpData(setUpData: ExampleFormChainViewData): ExampleFormSetUpData {
  return {
    positionsOptions: _transformTokenListOption(setUpData.userData.positions),
    assets: {
      asset: setUpData.erc20Data[0],
      sdAsset: setUpData.erc20Data[1],
      gaugeAsset: setUpData.erc20Data[2],
    },
  }
}

function _transformTokenListOption(positions: TokenizedPosition[]): SelectOption[] {
  return (
    positions?.map((p) => {
      return {
        label: `Tkn.  ${p.tknId?.toString()?.padStart(4, "0")}`,
        value: p.tknId.toString(),
      }
    }) || []
  )
}

export async function doApprove(asset: Address, contract: Address) {
  return new Promise<void>((resolve) => {
    console.info(asset, contract)
    resolve()
  })
}

export async function doDeposit(contract: Address, assetType: ExampleFormAssetType, amount: bigint, selectedPosition: number) {
  return new Promise<void>((resolve) => {
    console.info(assetType, contract, amount, selectedPosition)
    resolve()
  })
}

export function getFormState(currentAsset: ExampleFormAssetData & (AssetUserData | undefined), formValues: ExampleFormValues, isWellConnected: boolean) {
  let isApproved = false
  const reasons: string[] = []

  // check the wallet
  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    if (currentAsset) {
      // check the allowance (no allowance or check numbers)
      isApproved = !currentAsset?.approveContract || (!!currentAsset?.allowance && formValues.value <= currentAsset.allowance)
      if (formValues.value === 0n) {
        reasons.push("No amount.")
      } else if (formValues.value > currentAsset.balance!) {
        reasons.push("Not enough balance.")
      }
    } else {
      reasons.push("No selected asset.")
    }
  }
  return { canProcess: isApproved && reasons.length === 0, cantProcessReasons: reasons, haveToApprove: !isApproved }
}
