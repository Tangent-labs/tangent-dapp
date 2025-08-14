import { Abi, Address, encodeFunctionData, Hex, zeroAddress } from "viem"
import routes from "./swapRoutes.json"
import QuotesCurveRouter from "../../../abi/USG/QuotesCurveRouter.json"
import QuotesPendleRouter from "../../../abi/USG/QuotesPendleRouter.json"
import { executeChainViewUnique } from "@/services/service_rpc"
import CurveRouterABI from "../../../abi/USG/CurveRouter.json"
import PendleRouterABI from "../../../abi/USG/PendleRouter.json"
import { USG_CONTRACT } from "./tg_usd_repository"

type RawRoute = {
  params: {
    routeAddresses: string[]
    swapParamsFull: number[][]
  }
  display: string
}

const returnCustomQuoteData = async (tokenIn: Address, tokenOut: Address, amount: bigint, protocol: string) => {
  type RoutesMap = Record<string, Record<string, RawRoute[]>>

  const matchingRoutes =
    (routes.success as RoutesMap)?.[tokenIn.toLowerCase()]?.[tokenOut.toLowerCase()]?.map((route) => ({
      _route: route.params.routeAddresses,
      _swap_params: route.params.swapParamsFull,
      _amount: amount,
      _pools: [zeroAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress],
    })) ?? []

  let abi
  let bytecode

  if (protocol === "curve") {
    abi = QuotesCurveRouter.abi
    bytecode = QuotesCurveRouter.bytecode
  }

  if (protocol === "pendle") {
    abi = QuotesPendleRouter.abi
    bytecode = QuotesPendleRouter.bytecode
  }

  const quotes = await executeChainViewUnique<bigint[]>(abi as Abi, bytecode as Hex, [matchingRoutes])

  const bestQuote: bigint = quotes!.reduce((a, b) => (a > b ? a : b))

  return { matchingRoutes, quotes, bestQuote }
}

export const getCustomQuote = async (tokenIn: Address, tokenOut: Address, amount: bigint, protocol: string) => {
  const { bestQuote } = await returnCustomQuoteData(tokenIn, tokenOut, amount, protocol)

  return bestQuote
}

export const getCustomRouterRoute = async (tokenIn: Address, tokenOut: Address, amount: bigint, minAmountOut: bigint, receiver: Address, protocol: string) => {
  const { matchingRoutes, quotes, bestQuote } = await returnCustomQuoteData(tokenIn, tokenOut, amount, protocol)

  const biggestValueIndex = quotes?.indexOf(bestQuote) as number

  const matchingRoute = matchingRoutes[biggestValueIndex]

  let abi
  let routerAddress

  if (protocol === "curve") {
    abi = CurveRouterABI
    routerAddress = USG_CONTRACT.CURVE_ROUTER
  }

  if (protocol === "pendle") {
    abi = PendleRouterABI
    routerAddress = USG_CONTRACT.PENDLE_ROUTER
  }

  const data = encodeFunctionData({
    abi: abi as Abi,
    functionName: "exchange",
    args: [matchingRoute._route, matchingRoute._swap_params, amount, minAmountOut, matchingRoute._pools, receiver],
  })

  return { data, routerAddress }
}
