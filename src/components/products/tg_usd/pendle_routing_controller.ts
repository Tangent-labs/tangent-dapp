import { USG_CONTRACT } from "./tg_usd_repository"
import { PendlePools } from "@tangent/defi-resources"
import PendlePTRouter from "../../../abi/USG/PendlePTRouter.json"
import QuoteTokenToPT from "../../../abi/USG/QuoteTokenToPT.json"
import QuotePTToToken from "../../../abi/USG/QuotePTToToken.json"
import { executeChainViewUnique } from "@/services/service_rpc"
import { Abi, Address, encodeFunctionData, Hex, zeroAddress } from "viem"
import { PendlePTToSYQuote, PendleSYToPTQuote } from "./tg_usd_type"
import { CustomCurveRoutes } from "./global_quote_controller"

type RawRoute = {
  params: {
    routeAddresses: string[]
    swapParamsFull: number[][]
  }
  display: string
}

const returnCustomPendleQuoteData = async (
  customCurveRoutes: CustomCurveRoutes,
  tokenIn: Address,
  tokenOut: Address,
  amount: bigint,
  swapDirection: string
) => {
  type RoutesMap = Record<string, Record<string, RawRoute[]>>

  const pendlePT = swapDirection === "tokenToPT" ? tokenOut : tokenIn

  const underlyingPool = Object.values(PendlePools).find((pool) => pool.PT.toLowerCase() === pendlePT.toLowerCase())

  let underlyings
  let abi
  let bytecode

  const matchingRoutes: Array<{ _route: string[]; _swap_params: number[][]; _amount: bigint; _pools: Address[] }> = []

  if (swapDirection === "tokenToPT") {
    abi = QuoteTokenToPT.abi
    bytecode = QuoteTokenToPT.bytecode
    underlyings = underlyingPool?.UNDERLYING_IN
  } else {
    abi = QuotePTToToken.abi
    bytecode = QuotePTToToken.bytecode
    underlyings = underlyingPool?.UNDERLYING_OUT
  }

  const params: {
    curveRouterData: { _route: string[]; _swap_params: number[][]; _amount: bigint; _pools: Address[] }
    data: PendleSYToPTQuote | PendlePTToSYQuote
  }[] = []

  underlyings?.forEach((u: string) => {
    const [routeTokenIn, routeTokenOut] = swapDirection === "tokenToPT" ? [tokenIn, u] : [u, tokenOut]

    const curveRoutes = (customCurveRoutes?.success as RoutesMap)?.[routeTokenIn.toLowerCase()]?.[routeTokenOut.toLowerCase()] ?? []

    if (swapDirection === "tokenToPT") {
      const syToPTData: PendleSYToPTQuote = {
        market: underlyingPool?.MARKET,
        pt: underlyingPool?.PT,
        sy: underlyingPool?.SY,
        underlyingIn: u,
        tokenInAmount: amount,
      }

      for (const r of curveRoutes) {
        const curveQuote = {
          _route: r.params.routeAddresses,
          _swap_params: r.params.swapParamsFull,
          _amount: amount,
          _pools: [zeroAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress],
        }

        matchingRoutes.push(curveQuote)
        params.push({ curveRouterData: curveQuote, data: syToPTData })
      }
    } else {
      const PTToSYData: PendlePTToSYQuote = {
        market: underlyingPool?.MARKET,
        pt: underlyingPool?.PT,
        sy: underlyingPool?.SY,
        underlyingOut: u,
        ptAmount: amount,
      }

      for (const r of curveRoutes) {
        const curveQuote = {
          _route: r.params.routeAddresses,
          _swap_params: r.params.swapParamsFull,
          _amount: amount,
          _pools: [zeroAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress],
        }

        matchingRoutes.push(curveQuote)
        params.push({ curveRouterData: curveQuote, data: PTToSYData })
      }
    }
  })

  const quotes = await executeChainViewUnique<bigint[]>(abi as Abi, bytecode as Hex, [params])

  const bestQuote = quotes?.reduce((a, b) => (a > b ? a : b))

  return { matchingRoutes, quotes, bestQuote }
}

export const getCustomPendleQuote = async (
  customCurveRoutes: CustomCurveRoutes,
  tokenIn: Address,
  tokenOut: Address,
  amount: bigint,
  swapDirection: string
) => {
  const { bestQuote } = await returnCustomPendleQuoteData(customCurveRoutes, tokenIn, tokenOut, amount, swapDirection)

  return bestQuote as bigint
}

export const getPendleCustomRouterRoute = async (
  customCurveRoutes: CustomCurveRoutes,
  tokenIn: Address,
  tokenOut: Address,
  amount: bigint,
  minAmountOut: bigint,
  receiver: Address,
  swapDirection: string
) => {
  const { matchingRoutes, quotes, bestQuote } = await returnCustomPendleQuoteData(customCurveRoutes, tokenIn, tokenOut, amount, swapDirection)

  const biggestValueIndex = quotes?.indexOf(bestQuote!) as number

  const matchingRoute = matchingRoutes[biggestValueIndex]

  const fn = swapDirection === "tokenToPT" ? "swapTokenForPT" : "swapPTForToken"

  const pendlePT = swapDirection === "tokenToPT" ? tokenOut : tokenIn

  const underlyingPool = Object.values(PendlePools).find((pool) => pool.PT.toLowerCase() === pendlePT.toLowerCase())

  if (fn === "swapTokenForPT") {
    const data = encodeFunctionData({
      abi: PendlePTRouter.abi as Abi,
      functionName: "swapTokenForPT",
      args: [
        {
          _route: matchingRoute._route,
          _swap_params: matchingRoute._swap_params,
          _amount: amount,
          _min_dy: 0n,
          _pools: matchingRoute._pools,
          _receiver: USG_CONTRACT.PENDLE_ROUTER,
        },
        {
          market: underlyingPool?.MARKET,
          pt: underlyingPool?.PT,
          sy: underlyingPool?.SY,
          underlyingIn: underlyingPool?.UNDERLYING_IN[0],
          receiver,
          minPTOut: minAmountOut,
        },
      ],
    })

    return { data, routerAddress: USG_CONTRACT.PENDLE_ROUTER }
  } else {
    const data = encodeFunctionData({
      abi: PendlePTRouter.abi as Abi,
      functionName: "swapPTForToken",
      args: [
        {
          market: underlyingPool?.MARKET,
          pt: underlyingPool?.PT,
          sy: underlyingPool?.SY,
          yt: underlyingPool?.YT,
          underlyingOut: underlyingPool?.UNDERLYING_OUT[0],
          ptAmount: amount,
        },
        {
          _route: matchingRoute._route,
          _swap_params: matchingRoute._swap_params,
          _min_dy: minAmountOut,
          _pools: matchingRoute._pools,
          _receiver: receiver,
        },
      ],
    })

    return { data, routerAddress: USG_CONTRACT.PENDLE_ROUTER }
  }
}
