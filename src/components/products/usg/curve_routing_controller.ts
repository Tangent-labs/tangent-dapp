import { USG_CONTRACT } from "./usg_repository"
import CurveRouterABI from "../../../abi/USG/CurveRouter.json"
import { executeChainViewUnique } from "@/services/service_rpc"
import QuotesCurveRouter from "../../../abi/USG/QuotesCurveRouter.json"
import { Abi, Address, encodeFunctionData, Hex, zeroAddress } from "viem"
import { CustomCurveRoutes } from "./global_quote_controller"

const returnCustomQuoteData = async (customCurveRoutes: CustomCurveRoutes, tokenIn: Address, tokenOut: Address, amount: bigint) => {
  const matchingRoutes =
    customCurveRoutes.success?.[tokenIn.toLowerCase()]?.[tokenOut.toLowerCase()]?.map((route) => ({
      _route: route.params.routeAddresses,
      _swap_params: route.params.swapParamsFull,
      _amount: amount,
      _pools: [zeroAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress],
    })) ?? []

  const abi = QuotesCurveRouter.abi
  const bytecode = QuotesCurveRouter.bytecode

  const quotes = await executeChainViewUnique<bigint[]>(abi as Abi, bytecode as Hex, [matchingRoutes])

  if (quotes) {
    const bestQuote: bigint = quotes.length > 0 ? quotes!.reduce((a, b) => (a > b ? a : b)) : 0n

    return { matchingRoutes, quotes, bestQuote }
  }
  return { matchingRoutes, quotes: [], bestQuote: 0n }
}

export const getCustomQuote = async (customCurveRoutes: CustomCurveRoutes, tokenIn: Address, tokenOut: Address, amount: bigint) => {
  const { bestQuote } = await returnCustomQuoteData(customCurveRoutes, tokenIn, tokenOut, amount)

  return bestQuote
}

export const getCustomRouterRoute = async (
  customCurveRoutes: CustomCurveRoutes,
  tokenIn: Address,
  tokenOut: Address,
  amount: bigint,
  minAmountOut: bigint,
  receiver: Address
) => {
  const { matchingRoutes, quotes, bestQuote } = await returnCustomQuoteData(customCurveRoutes, tokenIn, tokenOut, amount)

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
