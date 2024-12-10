import SdtUtilitiesABI from "@/abi/booster/SdtUtilities.json"
import BoosterOutExpectedABI from "@/abi/booster/BoosterOutExpected.json"
import SdtStakingPositionServiceABI from "@/abi/booster/SdtStakingPositionService.json"
import { Abi, Address, EstimateContractGasParameters, Hex, maxUint256, WalletClient, WriteContractParameters, zeroAddress } from "viem"
import {
  BoosterConvertOut,
  BoosterDepositAssetInfo,
  BoosterDepositParams,
  BoosterDepositType,
  BoosterDetailOut,
  BoosterGaugeParams,
  BoosterStakingInfo,
  ConvertAndStakeSdAssetParams,
} from "@products/booster/booster_type"
import { TOKEN_ADDR } from "@/services/repo_asset_addresses"
import { AssetDataPriced, AssetUserData, ExistingAsset } from "@/types"
import { BOOSTER_CONTRACT } from "../../booster_repository"
import { executeChainViewUnique, getApproveTx, getPublicClient, waitForTransaction } from "@/services/service_rpc"

export const getDepositAssetInfo = (
  currentAsset: BoosterDepositType,
  onChainData: BoosterDetailOut,
  stakingInfo: BoosterStakingInfo,
  tokenInfo?: AssetDataPriced[]
) => {
  let tokenAddress: Address
  let assetData: AssetDataPriced | undefined
  if (["asset", "sdAsset"].includes(currentAsset)) {
    const asset = stakingInfo[currentAsset] as ExistingAsset
    tokenAddress = TOKEN_ADDR[asset]
  } else {
    tokenAddress = stakingInfo.gaugeAsset
  }

  if (currentAsset === "asset") assetData = tokenInfo?.find((t) => t.logo === stakingInfo[currentAsset])
  else assetData = tokenInfo?.find((t) => t.logo === stakingInfo.sdAsset)

  if (currentAsset === "gaugeAsset") {
    assetData = { ...assetData, displaySymbol: `${assetData?.symbol}-gauge` } as AssetDataPriced
  }
  const onChainBalance = onChainData.obas.find((o) => o.token === tokenAddress)
  const balance = {
    balance: onChainBalance?.balance || 0n,
    allowance: onChainBalance?.allowances?.at(0)?.allowance || 0n,
  }
  return {
    balance: balance as AssetUserData,
    address: tokenAddress,
    current: currentAsset,
    asset: assetData,
  } as BoosterDepositAssetInfo
}

export function getFormState(currentAsset?: BoosterDepositAssetInfo, weiValue?: bigint, expected?: bigint, isWellConnected?: boolean) {
  let isApproved = false
  const reasons: string[] = []

  // check the wallet
  if (!isWellConnected) {
    reasons.push("No connected wallet.")
  } else {
    if (currentAsset) {
      // check the allowance (no allowance or check numbers)
      isApproved = !!currentAsset?.balance?.allowance && (weiValue || 0n) <= currentAsset?.balance.allowance
      if (weiValue === 0n) {
        reasons.push("No amount.")
      } else if ((weiValue || 0n) > (currentAsset?.balance?.balance || 0n)) {
        reasons.push("Not enough balance.")
      }
      if ((currentAsset.current === "asset" && !expected) || expected === 0n) {
        reasons.push("")
      }
    } else {
      reasons.push("No selected asset.")
    }
  }
  return { canProcess: isApproved && reasons.length === 0, cantProcessReasons: reasons, haveToApprove: !isApproved }
}

export const getExpectedSdAsset = async (stakingContract: Address, weiValue: bigint, isLock: boolean) => {
  const data = await executeChainViewUnique<BoosterConvertOut>(BoosterOutExpectedABI.abi as Abi, BoosterOutExpectedABI.bytecode as Hex, [
    stakingContract,
    weiValue,
    isLock,
  ])
  return data
}

export const doBoosterDeposit = async (params: BoosterDepositParams) => {
  switch (params.current) {
    case "asset":
    case "sdAsset":
      await doDepositAsset(params)
      break

    case "gaugeAsset":
      await doDepositGaugeAsset(params)
      break
  }
}

export const doApprove = async (walletClient: WalletClient, assetType: BoosterDepositType, assetAddress: Address, amount: bigint, stakingContract: Address) => {
  const publicClient = await getPublicClient()
  amount = amount || maxUint256
  switch (assetType) {
    case "asset":
    case "sdAsset": {
      const txData = getApproveTx(assetAddress, BOOSTER_CONTRACT.SDT_UTILITIES, amount)
      const gas = await publicClient.estimateContractGas(txData as unknown as EstimateContractGasParameters)
      txData.gas = gas
      const hash = await walletClient.writeContract(txData as unknown as WriteContractParameters)
      return await waitForTransaction(hash)
    }
    case "gaugeAsset": {
      const txData = getApproveTx(assetAddress, stakingContract, amount)
      const gas = await publicClient.estimateContractGas(txData as unknown as EstimateContractGasParameters)
      txData.gas = gas
      const hash = await walletClient.writeContract(txData as unknown as WriteContractParameters)
      return await waitForTransaction(hash)
    }
  }
}

const doDepositAsset = async ({ walletClient, tokenId, stakingInfo, current, expectedSdAsset, weiValue, isLock }: BoosterDepositParams) => {
  let params: ConvertAndStakeSdAssetParams
  if (current === "asset") {
    params = [tokenId, stakingInfo.stakingAddress, 0n, expectedSdAsset, 0n, weiValue, isLock]
  } else if (current === "sdAsset") {
    params = [tokenId, stakingInfo.stakingAddress, 0n, 0n, weiValue, 0n, isLock]
  } else {
    // current === "gaugeAsset"
    params = [tokenId, stakingInfo.stakingAddress, weiValue, 0n, 0n, 0n, isLock]
  }

  const [account] = await walletClient.requestAddresses()
  const publicClient = await getPublicClient()
  const txData = {
    abi: SdtUtilitiesABI.abi,
    functionName: "convertAndStakeSdAsset",
    args: params as unknown[],
    address: BOOSTER_CONTRACT.SDT_UTILITIES,
    account,
    gas: undefined as undefined | bigint,
  }
  const gas = await publicClient.estimateContractGas(txData)
  txData.gas = gas

  const hash = await walletClient.writeContract(txData as unknown as WriteContractParameters)
  return hash
}

const doDepositGaugeAsset = async ({ walletClient, stakingInfo, tokenId, weiValue }: BoosterGaugeParams) => {
  const [account] = await walletClient.requestAddresses()
  const publicClient = await getPublicClient()
  const txData = {
    abi: SdtStakingPositionServiceABI.abi,
    functionName: "deposit",
    args: [tokenId, weiValue, zeroAddress] as unknown[],
    address: stakingInfo.stakingAddress,
    account,
    gas: undefined as undefined | bigint,
  }
  const gas = await publicClient.estimateContractGas(txData)
  txData.gas = gas

  const hash = await walletClient.writeContract(txData as unknown as WriteContractParameters)
  return hash
}
