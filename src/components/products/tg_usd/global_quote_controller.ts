import { Address } from "viem"
import { TGUSD_CONTRACT } from "./tg_usd_repository"
import { getCurveRouterQuote, getCurveRouterRoute } from "./curve_routing_controller"
import { getRouteTxData, getTokenQuote } from "./quote_api"

export const returnEnsoQuote = async (depositWeiValue: bigint, currentAddress: Address, tokenOut: Address, tokenIn: Address, slippage: number) => {
  const data = await getTokenQuote(depositWeiValue, currentAddress, tokenOut, tokenIn, slippage * 100)

  if (data) {
    return data
  } else if (tokenOut === TGUSD_CONTRACT?.TG_USD || tokenIn === TGUSD_CONTRACT?.TG_USD) {
    return getCurveRouterQuote(tokenIn, tokenOut, depositWeiValue)
  } else {
    return undefined
  }
}

export const returnRoute = async (
  tokenIn: Address,
  tokenOut: Address,
  amount: bigint,
  minAmountOut: bigint,
  receiver: Address,
  fromAddress: Address,
  user: Address
) => {
  const route = await getRouteTxData(amount, tokenIn, tokenOut, fromAddress, receiver, 1000)

  if (route) {
    return { data: route?.tx?.data, routerAddress: "0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf" as Address }
  } else if (tokenOut === TGUSD_CONTRACT?.TG_USD || tokenIn === TGUSD_CONTRACT?.TG_USD) {
    const curveRoute = await getCurveRouterRoute(tokenIn, tokenOut, amount, 0n, user)
    return { data: curveRoute, routerAddress: "0x45312ea0eff7e09c83cbe249fa1d7598c4c8cd4e" as Address }
  } else {
    return undefined
  }
}
