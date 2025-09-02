import { Address } from "viem"
import { getEnsoData } from "./api"
import { VSTAN_CONTRACT } from "../vs_tan/rs_tan_repository"
import { PendleCollaterals, USG_CONTRACT } from "./tg_usd_repository"
import { getCustomQuote, getCustomRouterRoute } from "./curve_routing_controller"

const curveRouterTokens = [USG_CONTRACT?.USG, USG_CONTRACT?.USG, VSTAN_CONTRACT?.TAN, VSTAN_CONTRACT?.STAN]

const isCurveRouter = (tokenIn: Address, tokenOut: Address) => {
  return curveRouterTokens.includes(tokenIn) || curveRouterTokens.includes(tokenOut)
}

const isPendleRouter = (tokenIn: Address, tokenOut: Address) => {
  return PendleCollaterals.includes(tokenIn) || PendleCollaterals.includes(tokenOut)
}

export const getQuote = async (depositWeiValue: bigint, currentAddress: Address, tokenOut: Address, tokenIn: Address): Promise<{ quote: bigint }> => {
  const data = await getEnsoData(depositWeiValue, tokenIn, tokenOut, currentAddress, currentAddress, 0n)

  if (data) {
    return { quote: data?.amountOut }
  } else if (isCurveRouter(tokenIn, tokenOut)) {
    const quote = await getCustomQuote(tokenIn, tokenOut, depositWeiValue, "curve")
    return { quote }
  } else if (isPendleRouter(tokenIn, tokenOut)) {
    const quote = await getCustomQuote(tokenIn, tokenOut, depositWeiValue, "pendle")
    return { quote }
  } else {
    return { quote: 0n }
  }
}

export const getRoute = async (
  tokenIn: Address,
  tokenOut: Address,
  amount: bigint,
  minAmountOut: bigint,
  receiver: Address,
  fromAddress: Address,
  user?: Address
) => {
  const route = await getEnsoData(amount, tokenIn, tokenOut, fromAddress, receiver, minAmountOut)

  if (route) {
    return { data: route?.tx?.data as string, routerAddress: route?.tx?.to }
  } else if (isCurveRouter(tokenIn, tokenOut)) {
    const { data, routerAddress } = await getCustomRouterRoute(tokenIn, tokenOut, amount, minAmountOut, user ? user : receiver, "curve")
    return { data, routerAddress }
  } else if (isPendleRouter(tokenIn, tokenOut)) {
    const { data, routerAddress } = await getCustomRouterRoute(tokenIn, tokenOut, amount, minAmountOut, user ? user : receiver, "pendle")
    return { data, routerAddress }
  } else {
    return undefined
  }
}
