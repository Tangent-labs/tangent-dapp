import routes from "./swapRoutes.json"
import { USG_CONTRACT } from "./tg_usd_repository"
import { PendlePools } from "@tangent/defi-resources"
import PendlePTRouter from "../../../abi/USG/PendlePTRouter.json"
import QuoteTokenToPT from "../../../abi/USG/QuoteTokenToPT.json"
import QuotePTToToken from "../../../abi/USG/QuotePTToToken.json"
import { executeChainViewUnique } from "@/services/service_rpc"
import { Abi, Address, encodeFunctionData, Hex, zeroAddress } from "viem"
import { PendleSYToPTQuote } from "./tg_usd_type"

type RawRoute = {
  params: {
    routeAddresses: string[]
    swapParamsFull: number[][]
  }
  display: string
}

const returnCustomPendleQuoteData = async (tokenIn: Address, tokenOut: Address, amount: bigint, swapDirection: string) => {
  type RoutesMap = Record<string, Record<string, RawRoute[]>>

  const pendlePT = swapDirection === "tokenToPT" ? tokenOut : tokenIn

  const underlyingPool = Object.values(PendlePools).find((pool) => pool.PT.toLowerCase() === pendlePT.toLowerCase())

  let underlyings

  if (swapDirection === "tokenToPT") {
    underlyings = underlyingPool?.UNDERLYING_IN
  } else {
    underlyings = underlyingPool?.UNDERLYING_OUT
  }

  const matchingRoutes: Array<{ _route: string[]; _swap_params: number[][]; _amount: bigint; _pools: Address[] }> = []

  let abi
  let bytecode

  if (swapDirection === "tokenToPT") {
    abi = QuoteTokenToPT.abi
    bytecode = QuoteTokenToPT.bytecode
  } else {
    abi = QuotePTToToken.abi
    bytecode = QuotePTToToken.bytecode
  }

  const params: { curveRouterData: { _route: string[]; _swap_params: number[][]; _amount: bigint; _pools: Address[] }; syToPTData: PendleSYToPTQuote }[] = []

  underlyings?.forEach((u: string) => {
    const [routeTokenIn, routeTokenOut] = swapDirection === "tokenToPT" ? [tokenIn, u] : [u, tokenOut]

    const curveRoutes = (routes?.success as RoutesMap)?.[routeTokenIn.toLowerCase()]?.[routeTokenOut.toLowerCase()] ?? []

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
      params.push({ curveRouterData: curveQuote, syToPTData })
    }
  })

  const quotes = await executeChainViewUnique<bigint[]>(abi as Abi, bytecode as Hex, [params])

  const bestQuote = quotes?.reduce((a, b) => (a > b ? a : b))

  return { matchingRoutes, quotes, bestQuote }
}

export const getCustomPendleQuote = async (tokenIn: Address, tokenOut: Address, amount: bigint, swapDirection: string) => {
  const { bestQuote } = await returnCustomPendleQuoteData(tokenIn, tokenOut, amount, swapDirection)

  return bestQuote as bigint
}

export const getPendleCustomRouterRoute = async (
  tokenIn: Address,
  tokenOut: Address,
  amount: bigint,
  minAmountOut: bigint,
  receiver: Address,
  swapDirection: string
) => {
  const { matchingRoutes, quotes, bestQuote } = await returnCustomPendleQuoteData(tokenIn, tokenOut, amount, swapDirection)

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
          _receiver: receiver,
        },
        {
          market: underlyingPool?.MARKET,
          pt: underlyingPool?.PT,
          sy: underlyingPool?.SY,
          underlyingIn: underlyingPool?.UNDERLYING_IN[0],
          receiver,
          minPTOut: 0n,
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
