import { USG_CONTRACT } from "./usg_repository"
import CurveRouterABI from "../../../abi/USG/CurveRouter.json"
import { executeChainViewUnique } from "@/services/service_rpc"
import QuotesCurveRouterImpact from "../../../abi/USG/QuotesCurveRouterImpact.json"
import { Abi, Address, encodeFunctionData, formatUnits, Hex, zeroAddress } from "viem"
import { CustomCurveRoutes } from "./global_quote_controller"

const returnCustomQuoteData = async (customCurveRoutes: CustomCurveRoutes, tokenIn: Address, tokenOut: Address, amount: bigint) => {
  const matchingRoutes =
    customCurveRoutes.success?.[tokenIn.toLowerCase()]?.[tokenOut.toLowerCase()]?.map((route) => ({
      _route: route.params.routeAddresses,
      _swap_params: route.params.swapParamsFull,
      _amount: amount,
      _pools: [zeroAddress, zeroAddress, zeroAddress, zeroAddress, zeroAddress],
    })) ?? []

  const abi = QuotesCurveRouterImpact.abi
  const bytecode = QuotesCurveRouterImpact.bytecode

  const quotesArray = await executeChainViewUnique<{ quote: bigint; priceImpact: bigint }[]>(abi as Abi, bytecode as Hex, [matchingRoutes])

  if (quotesArray && quotesArray.length > 0) {
    const bestQuote = quotesArray.reduce((best, current) => (current.quote > best.quote ? current : best))

    return {
      matchingRoutes,
      quotes: quotesArray,
      bestQuote: bestQuote,
    }
  }

  return {
    matchingRoutes,
    quotes: [],
    bestQuote: {
      quote: 0n,
      priceImpact: 0n,
    },
  }
}

export const getCurveQuote = async (customCurveRoutes: CustomCurveRoutes, tokenIn: Address, tokenOut: Address, amount: bigint) => {
  const { bestQuote } = await returnCustomQuoteData(customCurveRoutes, tokenIn, tokenOut, amount)

  return { quote: bestQuote.quote, priceImpact: Number(formatUnits(bestQuote.priceImpact, 14)) }
}

export const getCurveRouterRoute = async (
  customCurveRoutes: CustomCurveRoutes,
  tokenIn: Address,
  tokenOut: Address,
  amount: bigint,
  minAmountOut: bigint,
  receiver: Address
) => {
  const { matchingRoutes, quotes, bestQuote } = await returnCustomQuoteData(customCurveRoutes, tokenIn, tokenOut, amount)

  const bestQuoteItem = quotes?.find((el) => el?.quote === bestQuote?.quote) || {
    quote: 0n,
    priceImpact: 0n,
  }

  const biggestValueIndex = quotes?.indexOf(bestQuoteItem) as number

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
