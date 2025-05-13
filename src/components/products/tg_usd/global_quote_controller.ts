import { Address } from "viem"
import { TGUSD_CONTRACT } from "./tg_usd_repository"
import { getCurveRouterQuote, getCurveRouterRoute } from "./curve_routing_controller"
import { getEnsoData } from "./quote_api"

export const getQuote = async (depositWeiValue: bigint, currentAddress: Address, tokenOut: Address, tokenIn: Address): Promise<{ quote: bigint }> => {
  const data = await getEnsoData(depositWeiValue, tokenIn, tokenOut, currentAddress, currentAddress, 0n)

  if (data) {
    return { quote: data?.amountOut }
  } else if (tokenOut === TGUSD_CONTRACT?.TG_USD || tokenIn === TGUSD_CONTRACT?.TG_USD) {
    const quote = await getCurveRouterQuote(tokenIn, tokenOut, depositWeiValue)
    return { quote }
  } else {
    return { quote: 0n }
  }
}

export const returnRoute = async (
  tokenIn: Address,
  tokenOut: Address,
  amount: bigint,
  minAmountOut: bigint,
  receiver: Address,
  fromAddress: Address,
  user?: Address
) => {
  const route = await getEnsoData(amount, tokenIn, tokenOut, fromAddress, receiver, minAmountOut)

  if (route) {
    return { data: route?.tx?.data as string, routerAddress: TGUSD_CONTRACT.ENSO_ROUTER as Address }
  } else if (tokenOut === TGUSD_CONTRACT?.TG_USD || tokenIn === TGUSD_CONTRACT?.TG_USD) {
    const curveRoute = await getCurveRouterRoute(tokenIn, tokenOut, amount, minAmountOut, user ? user : receiver)
    return { data: curveRoute as string, routerAddress: TGUSD_CONTRACT.CURVE_ROUTER as Address }
  } else {
    return undefined
  }
}
