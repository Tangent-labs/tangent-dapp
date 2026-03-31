import {
  EMPTY_FORM,
  IS_LOADING,
  NO_CONNECTED_WALLET,
  PRICE_IMPACT_ERROR,
  SLIPPAGE_ERROR,
  USG_REPAYED_ERROR,
} from "@/components/products/usg/record/usg_record_controller"

type MarketTransactionErrorProps = {
  error: string
}

const IGNORED_ERRORS = [SLIPPAGE_ERROR, PRICE_IMPACT_ERROR, USG_REPAYED_ERROR, EMPTY_FORM, IS_LOADING, NO_CONNECTED_WALLET]

export const MarketTransactionError = ({ error }: MarketTransactionErrorProps) => {
  if (!!error && !IGNORED_ERRORS?.includes(error))
    return <span className="my-2 flex h-4 w-full items-center justify-center text-sm font-semibold text-danger"> {error} </span>

  return <></>
}
