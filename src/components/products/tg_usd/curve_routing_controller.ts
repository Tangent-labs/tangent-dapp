import routes from "./swapRoutes.json"
import { USG_CONTRACT } from "./tg_usd_repository"
import CurveRouterABI from "../../../abi/USG/CurveRouter.json"
import { executeChainViewUnique } from "@/services/service_rpc"
import QuotesCurveRouter from "../../../abi/USG/QuotesCurveRouter.json"
import { Abi, Address, encodeFunctionData, Hex, zeroAddress } from "viem"

type RawRoute = {
  params: {
    routeAddresses: string[]
    swapParamsFull: number[][]
  }
  display: string
}

const returnCustomQuoteData = async (tokenIn: Address, tokenOut: Address, amount: bigint) => {
  type RoutesMap = Record<string, Record<string, RawRoute[]>>

  const matchingRoutes =
    (routes.success as RoutesMap)?.[tokenIn.toLowerCase()]?.[tokenOut.toLowerCase()]?.map((route) => ({
      _route: route.params.routeAddresses,
      _swap_params: route.params.swapParamsFull,
      _amount: amount,
      _pools: [zeroAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress],
    })) ?? []

  const abi = QuotesCurveRouter.abi
  const bytecode = QuotesCurveRouter.bytecode

  const quotes = await executeChainViewUnique<bigint[]>(abi as Abi, bytecode as Hex, [matchingRoutes])

  const bestQuote: bigint = quotes!.reduce((a, b) => (a > b ? a : b))

  return { matchingRoutes, quotes, bestQuote }
}

export const getCustomQuote = async (tokenIn: Address, tokenOut: Address, amount: bigint) => {
  const { bestQuote } = await returnCustomQuoteData(tokenIn, tokenOut, amount)

  return bestQuote
}

export const getCustomRouterRoute = async (tokenIn: Address, tokenOut: Address, amount: bigint, minAmountOut: bigint, receiver: Address) => {
  const { matchingRoutes, quotes, bestQuote } = await returnCustomQuoteData(tokenIn, tokenOut, amount)

  const biggestValueIndex = quotes?.indexOf(bestQuote) as number

  const matchingRoute = matchingRoutes[biggestValueIndex]

  const abi = CurveRouterABI
  const routerAddress = USG_CONTRACT.CURVE_ROUTER

  const data = encodeFunctionData({
    abi: abi as Abi,
    functionName: "exchange",
    args: [matchingRoute._route, matchingRoute._swap_params, amount, minAmountOut, matchingRoute._pools, receiver],
  })

  return { data, routerAddress }
}
