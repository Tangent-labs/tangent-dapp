import SdtUtilitiesABI from "@/abi/booster/SdtUtilities.json"
import { Address, getContract, maxUint256, WalletClient } from "viem"
import { BoosterDepositAssetInfo, BoosterDepositParams, BoosterDepositType, BoosterDetailOut, BoosterStakingInfo } from "@products/booster/booster_type"
import { TOKEN_ADDR } from "@/services/repo_asset_addresses"
import { AssetUserData, ExistingAsset } from "@/types"
import { BOOSTER_CONTRACT } from "../../booster_repository"
import { executeTransaction, getApproveTx, getPublicClient } from "@/services/service_rpc"

export const getDepositAssetInfo = (currentAsset: BoosterDepositType, onChainData: BoosterDetailOut, stakingInfo: BoosterStakingInfo) => {
  let tokenAddress: Address
  if (["asset", "sdAsset"].includes(currentAsset)) {
    const asset = stakingInfo[currentAsset] as ExistingAsset
    tokenAddress = TOKEN_ADDR[asset]
  } else {
    tokenAddress = stakingInfo.gaugeAsset
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
  } as BoosterDepositAssetInfo
}

export function getFormState(currentAsset?: BoosterDepositAssetInfo, weiValue?: bigint, isWellConnected?: boolean) {
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
    } else {
      reasons.push("No selected asset.")
    }
  }
  return { canProcess: isApproved && reasons.length === 0, cantProcessReasons: reasons, haveToApprove: !isApproved }
}

export const doApprove = async (walletClient: WalletClient, assetType: BoosterDepositType, amount: bigint, stakingContract: Address) => {
  amount = amount || maxUint256
  const [walletAddress] = await walletClient.getAddresses()
  switch (assetType) {
    case "asset":
    case "sdAsset": {
      const txData = getApproveTx(BOOSTER_CONTRACT.SDT_UTILITIES, walletAddress, amount)
      await executeTransaction(walletClient, txData)
      break
    }
    case "gaugeAsset": {
      const txData = getApproveTx(stakingContract, walletAddress, amount)
      await executeTransaction(walletClient, txData)
      break
    }
  }
}

export const doBoosterDeposit = async (params: BoosterDepositParams) => {
  switch (params.currentAsset.current) {
    case "asset":
    case "sdAsset":
      await doDepositAsset(params)
      break

    case "gaugeAsset":
      await doDepositGaugeAsset()
      break
  }
}

const doDepositAsset = async ({ walletClient, tokenId, stakingInfo, currentAsset, splippage, weiValue, isLock }: BoosterDepositParams) => {
  console.error({ splippage, isLock })
  const params: unknown[] = [tokenId, stakingInfo.stakingAddress]
  if (currentAsset.current === "asset") {
    params.push(0n) // _gaugeAssetAmount
    params.push(weiValue) // _minSdAssetAmountReceivedDuringSwap
    params.push(0n) // _sdAssetAmount
    params.push(weiValue) // _assetAmount
  }
  if (currentAsset.current === "sdAsset") {
    params.push(0n) // _gaugeAssetAmount
    params.push(0) // _minSdAssetAmountReceivedDuringSwap
    params.push(weiValue - (weiValue * 100n) / 1000n) // _sdAssetAmount
    params.push(0n) // _assetAmount
  }
  params.push(true) // isLock

  const [account] = await walletClient.requestAddresses()

  // const txData = _getDepositAssetAndSdTx(BOOSTER_CONTRACT.SDT_UTILITIES, params)
  const publicClient = await getPublicClient()
  const txData = {
    abi: SdtUtilitiesABI.abi,
    functionName: "convertAndStakeSdAsset",
    args: params,
    address: BOOSTER_CONTRACT.SDT_UTILITIES,
    account,
    gas: 0n,
  }

  //console.log(txData)
  const gas = await publicClient.estimateContractGas(txData)
  txData.gas = gas

  const contract = getSdtUtilitiesContract(walletClient)
  await contract.write.convertAndStakeSdAsset(txData as unknown as [args: readonly unknown[]])

  // const simulate = await publicClient.simulateContract(txData)
  // console.log({ simulate, gas }, { ...simulate.request, gas })

  // await walletClient.writeContract({ ...simulate.request, gas, chain })
  // const gas = await publicClient.estimateContractGas(txData)
  // console.log(gas)
  // const tx = await walletClient.prepareTransactionRequest({
  //   ...txData,
  //   gas,
  //   chain,
  // })
  // console.log(tx)
  // await executeTransaction(walletClient, txData)

  // await walletClient.writeContract({
  //   address: BOOSTER_CONTRACT.SDT_UTILITIES,
  //   abi: SdtUtilitiesABI.abi,
  //   functionName: "convertAndStakeSdAsset",
  //   args: params,
  //   gas: 69420n,
  //   chain: undefined,
  //   account,
  // })

  // const estimatedGas = await contract.estimateGas.convertAndStakeSdAsset({params)
  // await contract.write.convertAndStakeSdAsset(params)

  // const fallbackGasLimit = 200000 // Example fallback value
  //  await contract.write.convertAndStakeSdAsset({
  //   ...params,
  //   gasLimit: estimatedGas || fallbackGasLimit,
  // })
}

const getSdtUtilitiesContract = (walletClient: WalletClient) => {
  const publicClient = getPublicClient()

  const contract = getContract({
    address: BOOSTER_CONTRACT.SDT_UTILITIES,
    abi: SdtUtilitiesABI.abi,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  })
  return contract
}

// const _getDepositAssetAndSdTx = async (contract: Address, params: unknown[]) => {
//   // Prepare approve transaction data
//   const data = encodeFunctionData({
//     abi: SdtUtilitiesABI.abi,
//     functionName: "convertAndStakeSdAsset",
//     args: params,
//   })

//   // Encoded TX
//   return {
//     gas: 69420n,
//     to: contract,
//     data,
//   }
// }

const doDepositGaugeAsset = async () => {}
