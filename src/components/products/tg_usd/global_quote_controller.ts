import { Address } from "viem"
import { getEnsoData } from "./api"
import { PendleCollaterals, CurveCollaterals } from "./tg_usd_repository"
import { getCustomQuote, getCustomRouterRoute } from "./curve_routing_controller"
import { getCustomPendleQuote, getPendleCustomRouterRoute } from "./pendle_routing_controller"

export type CustomCurveRoutes = {
  success: { [from: string]: { [to: string]: { params: { routeAddresses: string[]; swapParamsFull: number[][] }; display: string }[] } }
  errors: string[]
}

const isCurveRouter = (tokenIn: Address, tokenOut: Address) => {
  return CurveCollaterals.includes(tokenIn) || CurveCollaterals.includes(tokenOut)
}

const isPendleRouter = (tokenIn: Address, tokenOut: Address) => {
  return PendleCollaterals.includes(tokenIn) || PendleCollaterals.includes(tokenOut)
}

export const getQuote = async (
  depositWeiValue: bigint,
  currentAddress: Address,
  tokenOut: Address,
  tokenIn: Address,
  curveRoutes: CustomCurveRoutes
): Promise<{ quote: bigint }> => {
  const data = await getEnsoData(depositWeiValue, tokenIn, tokenOut, currentAddress, currentAddress, 0n)
  if (data) {
    return { quote: data?.amountOut }
  } else if (isCurveRouter(tokenIn, tokenOut)) {
    const quote = await getCustomQuote(curveRoutes, tokenIn, tokenOut, depositWeiValue)
    return { quote }
  } else if (isPendleRouter(tokenIn, tokenOut)) {
    let swapDirection = "tokenToPT"

    if (PendleCollaterals.includes(tokenIn)) {
      swapDirection = "PTToToken"
    }

    const quote = await getCustomPendleQuote(curveRoutes, tokenIn, tokenOut, depositWeiValue, swapDirection)
    return { quote }
  } else {
    const quote = await getCustomQuote(curveRoutes, tokenIn, tokenOut, depositWeiValue)
    return { quote }
  }
}

export const getRoute = async (
  tokenIn: Address,
  tokenOut: Address,
  amount: bigint,
  minAmountOut: bigint,
  receiver: Address,
  fromAddress: Address,
  curveRoutes: CustomCurveRoutes,
  user?: Address
) => {
  const route = await getEnsoData(amount, tokenIn, tokenOut, fromAddress, receiver, minAmountOut)

  if (route) {
    return { data: route?.tx?.data as string, routerAddress: route?.tx?.to }
  } else if (isCurveRouter(tokenIn, tokenOut)) {
    const { data, routerAddress } = await getCustomRouterRoute(curveRoutes, tokenIn, tokenOut, amount, minAmountOut, user ? user : receiver)
    return { data, routerAddress }
  } else if (isPendleRouter(tokenIn, tokenOut)) {
    let swapDirection = "tokenToPT"

    if (PendleCollaterals.includes(tokenIn)) {
      swapDirection = "PTToToken"
    }

    const { data, routerAddress } = await getPendleCustomRouterRoute(
      curveRoutes,
      tokenIn,
      tokenOut,
      amount,
      minAmountOut,
      user ? user : receiver,
      swapDirection
    )

    return { data, routerAddress }
  } else {
    const { data, routerAddress } = await getCustomRouterRoute(curveRoutes, tokenIn, tokenOut, amount, minAmountOut, user ? user : receiver)
    return { data, routerAddress }
  }
}
