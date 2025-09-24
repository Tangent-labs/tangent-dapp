"use client"

import { formatBigInt } from "@/lib/number_formatter"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useUSGWithdrawContext } from "./usg_record_withdraw_context"
import FormButtons from "@/components/design_system/form/form_actions"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

export default function USGWithdrawContent() {
  const { canInteract } = useWalletConnexionContext()

  const { pricedCollateralInfo, collateralInfo } = useTgUsdRecordContext()

  const { formState, withdrawWeiValue, maxWithdrawable, withdrawPercentage, setWithdrawWeiValue, actionWithdraw, setWithdrawPercentage } =
    useUSGWithdrawContext()

  const WithdrawAssetDisplay = () => {
    return (
      <BorderPanel className="flex items-center gap-2 bg-select-input px-2.5 py-2">
        <TokenImage token={collateralInfo?.logo} size={32} />
        <span className="flex flex-col text-sm font-semibold">{collateralInfo.symbol}</span>
      </BorderPanel>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between">
            <span className="text-sm font-semibold md:text-[20px]">Withdraw collateral</span>
            <span className="text-xs text-subtitle">
              Max: {formatBigInt(maxWithdrawable, 18, 3)} {collateralInfo?.symbol}
            </span>
          </div>

          <DepositInput
            depositAmount={withdrawWeiValue}
            labelDeposit="You withdraw"
            depositSelect={<WithdrawAssetDisplay />}
            disabled={!canInteract}
            depositAsset={pricedCollateralInfo}
            balance={maxWithdrawable}
            displaySliderInput={true}
            setMaxBalance={() => setWithdrawWeiValue(maxWithdrawable)}
            onValueChange={setWithdrawWeiValue}
            percentage={withdrawPercentage}
            setPercentage={setWithdrawPercentage}
          />
        </div>

        <>
          {!!withdrawWeiValue && formState.cantProcessReasons.length > 0 && (
            <div className="flex w-full items-center justify-center text-xs text-red-500"> {formState.cantProcessReasons[0]}</div>
          )}
        </>

        <FormButtons actions={{ handleApprove: undefined, handleProcess: actionWithdraw }} formState={formState} labelProcess="Withdraw" />
      </div>
    </>
  )
}
