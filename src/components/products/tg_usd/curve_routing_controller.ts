import { USG_CONTRACT } from "./tg_usd_repository"
import CurveRouterABI from "../../../abi/USG/CurveRouter.json"
import { executeChainViewUnique } from "@/services/service_rpc"
import QuotesCurveRouterImpact from "../../../abi/USG/QuotesCurveRouterImpact.json"
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

  const abi = QuotesCurveRouterImpact.abi
  const bytecode = QuotesCurveRouterImpact.bytecode

  const quotesAndPriceImpacts = await executeChainViewUnique<Array<{ quote: bigint; priceImpact: bigint }>>(abi as Abi, bytecode as Hex, [matchingRoutes])

  if (quotesAndPriceImpacts) {
    const bestQuote: bigint = quotesAndPriceImpacts.length > 0 ? quotesAndPriceImpacts.map((el) => el.quote)!.reduce((a, b) => (a > b ? a : b)) : 0n

    const bestQuoteAndPriceImpact: {
      quote: bigint
      priceImpact: bigint
    } = quotesAndPriceImpacts.find((el) => el.quote === bestQuote) || {
      quote: 0n,
      priceImpact: 0n,
    }

    return { matchingRoutes, quotesAndPriceImpacts, bestQuoteAndPriceImpact }
  }
  return {
    matchingRoutes,
    quotesAndPriceImpacts: [],
    bestQuoteAndPriceImpact: {
      quote: 0n,
      priceImpact: 0n,
    },
  }
}

export const getCustomQuote = async (customCurveRoutes: CustomCurveRoutes, tokenIn: Address, tokenOut: Address, amount: bigint) => {
  const { bestQuoteAndPriceImpact } = await returnCustomQuoteData(customCurveRoutes, tokenIn, tokenOut, amount)

  return bestQuoteAndPriceImpact
}

export const getCustomRouterRoute = async (
  customCurveRoutes: CustomCurveRoutes,
  tokenIn: Address,
  tokenOut: Address,
  amount: bigint,
  minAmountOut: bigint,
  receiver: Address
) => {
  const { matchingRoutes, quotesAndPriceImpacts, bestQuoteAndPriceImpact } = await returnCustomQuoteData(customCurveRoutes, tokenIn, tokenOut, amount)

  const biggestValueIndex = quotesAndPriceImpacts?.indexOf(bestQuoteAndPriceImpact) as number

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
