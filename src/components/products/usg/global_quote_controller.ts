import { Address, getAddress } from "viem"
import { getEnsoData } from "./server_api"
import { PendleCollaterals, CurveCollaterals } from "./usg_repository"
import { getCurveQuote, getCurveRouterRoute } from "./curve_routing_controller"
import { getCustomPendleQuote, getPendleCustomRouterRoute } from "./pendle_routing_controller"

export type CustomCurveRoutes = {
  success: { [from: string]: { [to: string]: { params: { routeAddresses: string[]; swapParamsFull: number[][] }; display: string }[] } }
  errors: string[]
}

const isCollateral = (collaterals: Array<Address>, token: Address) => collaterals.includes(getAddress(token))

const isCurveRouter = (tokenIn: Address, tokenOut: Address) => {
  return isCollateral(CurveCollaterals, tokenIn) || isCollateral(CurveCollaterals, tokenOut)
}

const isPendleRouter = (tokenIn: Address, tokenOut: Address) => {
  return isCollateral(PendleCollaterals, tokenIn) || isCollateral(PendleCollaterals, tokenOut)
}

export const getQuote = async (
  amountIn: bigint,
  walletConnected: Address,
  tokenOut: Address,
  tokenIn: Address,
  curveRoutes: CustomCurveRoutes
): Promise<{ quote: bigint; priceImpact: number }> => {
  let customQuote: Promise<{ quote: bigint; priceImpact: number }>
  if (isPendleRouter(tokenIn, tokenOut)) {
    customQuote = getCustomPendleQuote(curveRoutes, tokenIn, tokenOut, amountIn, isCollateral(PendleCollaterals, tokenIn) ? "PTToToken" : "tokenToPT")
  } else {
    customQuote = getCurveQuote(curveRoutes, tokenIn, tokenOut, amountIn)
  }

  const [ensoResult, customResult] = await Promise.all([getEnsoData(amountIn, tokenIn, tokenOut, walletConnected, walletConnected, 0n), customQuote])
  const customRes = { quote: BigInt(customResult?.quote || 0n), priceImpact: customResult.priceImpact || 0 }
  const ensoRes = { quote: BigInt(ensoResult?.amountOut || 0n), priceImpact: ensoResult?.priceImpact || 0 }
  return customRes.quote >= ensoRes.quote ? customRes : ensoRes
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
    const { data, routerAddress } = await getCurveRouterRoute(curveRoutes, tokenIn, tokenOut, amount, minAmountOut, user ? user : receiver)
    return { data, routerAddress }
  } else if (isPendleRouter(tokenIn, tokenOut)) {
    let swapDirection = "tokenToPT"

    if (isCollateral(PendleCollaterals, tokenIn)) {
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
    const { data, routerAddress } = await getCurveRouterRoute(curveRoutes, tokenIn, tokenOut, amount, minAmountOut, user ? user : receiver)
    return { data, routerAddress }
  }
}
