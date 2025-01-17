import { Abi, Address, Hex, zeroAddress } from "viem"
import { ChainViewMarketRow } from "../tg_usd_type"
import { executeChainViewUnique } from "@/services/service_rpc"
import MarketDetailsUI from "@/abi/tgusd/MarketDetailsUI.json"

export const getTgUsdMarketRecordData = async (address: Address | undefined, market: Address) => {
  address = address || zeroAddress
  return await executeChainViewUnique<ChainViewMarketRow>(MarketDetailsUI.abi as Abi, MarketDetailsUI.bytecode as Hex, [address, market])
}
