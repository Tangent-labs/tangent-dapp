import { Abi, Address, encodeFunctionData, Hex, zeroAddress } from "viem"
import routes from "./swapRoutes.json"
import QuoteLiquidationRouter from "../../../abi/tgusd/QuoteLiquidationRouter.json"
import { executeChainViewUnique } from "@/services/service_rpc"
import CurveRouterABI from "../../../abi/tgusd/CurveRouter.json"

const returnQuoteData = async (tokenIn: Address, tokenOut: Address, amount: bigint) => {
  const matchingRoutes = routes
    .filter((el) => el.start.toLowerCase() === tokenIn.toLowerCase() && el.end.toLowerCase() === tokenOut.toLowerCase())
    .map((route) => {
      return {
        _route: route.params.routeAddresses,
        _swap_params: route.params.swapParamsFull,
        _amount: amount,
        _pools: [zeroAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress],
      }
    })

  const quotes = await executeChainViewUnique<bigint[]>(QuoteLiquidationRouter.abi as Abi, QuoteLiquidationRouter.bytecode as Hex, [matchingRoutes])

  const bestQuote: bigint = quotes!.reduce((a, b) => (a > b ? a : b))

  return { matchingRoutes, quotes, bestQuote }
}

export const getCurveRouterQuote = async (tokenIn: Address, tokenOut: Address, amount: bigint) => {
  const { bestQuote } = await returnQuoteData(tokenIn, tokenOut, amount)

  return bestQuote
}

export const getCurveRouterRoute = async (tokenIn: Address, tokenOut: Address, amount: bigint, minAmountOut: bigint, user: Address) => {
  const { matchingRoutes, quotes, bestQuote } = await returnQuoteData(tokenIn, tokenOut, amount)

  const biggestValueIndex = quotes?.indexOf(bestQuote) as number

  const matchingRoute = matchingRoutes[biggestValueIndex]

  return encodeFunctionData({
    abi: CurveRouterABI,
    functionName: "exchange",
    args: [matchingRoute._route, matchingRoute._swap_params, amount, minAmountOut, matchingRoute._pools, user],
  })
}
