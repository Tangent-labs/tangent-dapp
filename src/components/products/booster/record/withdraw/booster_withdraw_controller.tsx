import { getPublicClient } from "@/services/service_rpc"
import { BoosterGaugeParams } from "../../booster_type"
import SdtStakingPositionServiceABI from "@/abi/booster/SdtStakingPositionService.json"
import { WriteContractParameters } from "viem"

export const doBoosterWithdraw = async ({ walletClient, tokenId, weiValue, stakingInfo }: BoosterGaugeParams) => {
  const [account] = await walletClient.requestAddresses()
  const publicClient = await getPublicClient()
  const txData = {
    abi: SdtStakingPositionServiceABI.abi,
    functionName: "withdraw",
    args: [tokenId, weiValue] as unknown[],
    address: stakingInfo.stakingAddress,
    account,
    gas: undefined as undefined | bigint,
  }
  const gas = await publicClient.estimateContractGas(txData)
  txData.gas = gas

  const hash = await walletClient.writeContract(txData as unknown as WriteContractParameters)
  return hash
}
