import { Address, getAddress } from "viem"
import { getEnsoData } from "./server_api"
import { PendleCollaterals } from "./usg_repository"
import { getCurveQuote, getCurveRouterRoute } from "./curve_routing_controller"
import { getCustomPendleQuote, getPendleCustomRouterRoute } from "./pendle_routing_controller"

export type CustomCurveRoutes = {
  success: { [from: string]: { [to: string]: { params: { routeAddresses: string[]; swapParamsFull: number[][] }; display: string }[] } }
  errors: string[]
}

const isCollateral = (collaterals: Array<Address>, token: Address) => collaterals.includes(getAddress(token))

const isPendleRouter = (tokenIn: Address, tokenOut: Address) => {
  return isCollateral(PendleCollaterals, tokenIn) || isCollateral(PendleCollaterals, tokenOut)
}

export const getQuote = async (
  amountIn: bigint,
  walletConnected: Address,
  tokenOut: Address,
  tokenIn: Address,
  curveRoutes: CustomCurveRoutes
): Promise<{ quote: bigint; priceImpact: number; type: "custom" | "enso" }> => {
  let customQuote: Promise<{ quote: bigint; priceImpact: number }>
  if (isPendleRouter(tokenIn, tokenOut)) {
    customQuote = getCustomPendleQuote(curveRoutes, tokenIn, tokenOut, amountIn, isCollateral(PendleCollaterals, tokenIn) ? "PTToToken" : "tokenToPT")
  } else {
    customQuote = getCurveQuote(curveRoutes, tokenIn, tokenOut, amountIn)
  }

  const [ensoResult, customResult] = await Promise.all([getEnsoData(amountIn, tokenIn, tokenOut, walletConnected, walletConnected, 0n), customQuote])
  const customRes: { quote: bigint; priceImpact: number; type: "custom" | "enso" } = {
    quote: BigInt(customResult?.quote || 0n),
    priceImpact: customResult.priceImpact || 0,
    type: "custom",
  }
  const ensoRes: { quote: bigint; priceImpact: number; type: "custom" | "enso" } = {
    quote: BigInt(ensoResult?.amountOut || 0n),
    priceImpact: ensoResult?.priceImpact || 0,
    type: "enso",
  }
  return customRes.quote >= ensoRes.quote ? customRes : ensoRes
}

const getCustomQuote = (
  tokenIn: Address,
  tokenOut: Address,
  amount: bigint,
  curveRoutes: CustomCurveRoutes
): Promise<{ quote: bigint; priceImpact: number }> => {
  if (isPendleRouter(tokenIn, tokenOut)) {
    return getCustomPendleQuote(curveRoutes, tokenIn, tokenOut, amount, isCollateral(PendleCollaterals, tokenIn) ? "PTToToken" : "tokenToPT")
  }
  return getCurveQuote(curveRoutes, tokenIn, tokenOut, amount)
}

const customRouteFor = (
  tokenIn: Address,
  tokenOut: Address,
  amount: bigint,
  minAmountOut: bigint,
  receiver: Address,
  curveRoutes: CustomCurveRoutes
): Promise<{ data: string; routerAddress: string }> => {
  if (isPendleRouter(tokenIn, tokenOut)) {
    const swapDirection = isCollateral(PendleCollaterals, tokenIn) ? "PTToToken" : "tokenToPT"
    return getPendleCustomRouterRoute(curveRoutes, tokenIn, tokenOut, amount, minAmountOut, receiver, swapDirection)
  }
  return getCurveRouterRoute(curveRoutes, tokenIn, tokenOut, amount, minAmountOut, receiver)
}

/**
 * Fetches both routes bewteen ENSO and custom router and uses the best one
 */
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
  const recv = user ?? receiver

  // Quote both sources
  const [ensoRoute, customQuote] = await Promise.all([
    getEnsoData(amount, tokenIn, tokenOut, fromAddress, receiver, minAmountOut),
    getCustomQuote(tokenIn, tokenOut, amount, curveRoutes),
  ])

  const ensoAmount = BigInt(ensoRoute?.amountOut || 0n)
  const customAmount = BigInt(customQuote?.quote || 0n)

  // Go for custom when it quotes at least as well as ENSO
  if (customAmount > 0n && customAmount >= ensoAmount) {
    const custom = await customRouteFor(tokenIn, tokenOut, amount, minAmountOut, recv, curveRoutes)
    if (custom?.data) {
      return { data: custom.data, routerAddress: custom.routerAddress }
    }
  }

  // Otherwise use ENSO's route when it returned executable calldata
  if (ensoRoute?.tx?.data) {
    return { data: ensoRoute.tx.data as string, routerAddress: ensoRoute.tx.to }
  }

  // If no route is satisfying throw an error
  throw new Error("No swap route available for this asset.")
}
