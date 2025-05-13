import { Address } from "viem"
import { TGUSD_CONTRACT } from "./tg_usd_repository"
import { getCurveRouterQuote, getCurveRouterRoute } from "./curve_routing_controller"
import { getEnsoRoute } from "./quote_api"

export const getQuote = async (
  depositWeiValue: bigint,
  currentAddress: Address,
  tokenOut: Address,
  tokenIn: Address,
  minAmountOut: bigint
): Promise<{ quote: bigint }> => {
  const data = await getEnsoRoute(depositWeiValue, tokenIn, tokenOut, currentAddress, currentAddress, minAmountOut)

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
  const route = await getEnsoRoute(amount, tokenIn, tokenOut, fromAddress, receiver, minAmountOut)

  if (route) {
    return { data: route?.tx?.data as string, routerAddress: "0xF75584eF6673aD213a685a1B58Cc0330B8eA22Cf" as Address }
  } else if (tokenOut === TGUSD_CONTRACT?.TG_USD || tokenIn === TGUSD_CONTRACT?.TG_USD) {
    const curveRoute = await getCurveRouterRoute(tokenIn, tokenOut, amount, minAmountOut, user ? user : receiver)
    return { data: curveRoute as string, routerAddress: "0x45312ea0eff7e09c83cbe249fa1d7598c4c8cd4e" as Address }
  } else {
    return undefined
  }
}
