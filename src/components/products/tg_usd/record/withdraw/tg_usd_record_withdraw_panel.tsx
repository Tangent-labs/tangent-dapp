"use client"

import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { useTgUsdWithdrawContext } from "./tg_usd_record_withdraw_context"
import TokenImage from "@/components/design_system/structure/token_image"
import { formatBigInt } from "@/lib/number_formatter"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"

export default function TgUsdWithdrawPanel() {
  const { actionWithdraw, formState, withdrawWeiValue, setWithdrawWeiValue, maxWithdrawable, withdrawPercentage, setWithdrawPercentage } =
    useTgUsdWithdrawContext()

  const { tgUSDInfo, collateralInfo } = useTgUsdRecordContext()

  const { canInteract } = useWalletConnexionContext()

  const WithdrawAssetDisplay = () => {
    return (
      <div className="flex items-center gap-2 rounded-[10px] border-2 border-white border-opacity-20 bg-select-input px-3 py-2">
        <TokenImage token={collateralInfo?.logo} size={32} />
        <span className="flex flex-col text-sm font-semibold">{collateralInfo.symbol}</span>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between">
            <span className="text-[20px] font-semibold">Withdraw collateral</span>
            <span className="text-xs text-subtitle">
              Max: {formatBigInt(maxWithdrawable, 18, 3)} {collateralInfo?.symbol}
            </span>
          </div>

          <DepositInput
            depositAmount={withdrawWeiValue}
            labelDeposit="You withdraw"
            depositSelect={<WithdrawAssetDisplay />}
            disabled={!canInteract}
            depositAsset={tgUSDInfo}
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
