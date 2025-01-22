"use client"

import React from "react"
import { useTgUsdDepositContext } from "./tg_usd_record_deposit_context"
import { Switch } from "@/components/ui/switch"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { DepositRecieveInput } from "@/components/design_system/inputs/deposit_recieve_input"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import TokenImage from "@/components/design_system/structure/token_image"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import FormButtons from "@/components/design_system/form/form_actions"

export default function TgUsdDepositPanel() {
  const {
    isDepositAndBorrow,
    setIsDepositAndBorrow,
    isStaking,
    setIsStaking,
    depositWeiValue,
    setDepositWeiValue,
    actionApprove,
    actionDeposit,
    formState,
    borrowWeiValue,
    setBorrowWeiValue,
  } = useTgUsdDepositContext()
  const { collateralInfo, marketData, tgUSDInfo } = useTgUsdRecordContext()
  const { canInteract } = useWalletConnexionContext()

  const DepositAssetDisplay = () => {
    return (
      <PanelRaw className="flex w-48 items-center gap-2 border-white !bg-opacity-0 px-4 py-2 !backdrop-blur-none">
        <div className="">
          <TokenImage token={collateralInfo?.logo} size={32} />
        </div>
        <span className="flex flex-col text-lg leading-3">
          <span>{collateralInfo.symbol}</span>
        </span>
      </PanelRaw>
    )
  }
  const BorrowAssetDisplay = () => {
    return (
      <PanelRaw className="flex w-48 items-center gap-2 border-white !bg-opacity-0 px-4 py-2 !backdrop-blur-none">
        <div className="">
          <TokenImage token={"tgUSD"} size={32} />
        </div>
        <span className="flex flex-col text-lg leading-3">
          <span>tgUSD</span>
        </span>
      </PanelRaw>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* <div>-- {JSONdebug(marketData)} --</div> */}
        <div className="flex justify-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Save gas</span>
            <Switch checked={isStaking} onCheckedChange={(v) => setIsStaking(v)} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Deposit and borrow</span>
            <Switch checked={isDepositAndBorrow} onCheckedChange={(v) => setIsDepositAndBorrow(v)} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl">Deposit {collateralInfo?.symbol}</span>
          </div>
        </div>
        <div>
          <DepositRecieveInput
            displayRecieve={false}
            depositAmount={depositWeiValue}
            depositSelect={<DepositAssetDisplay />}
            disabled={!canInteract}
            recieveAssetDisplay={<DepositAssetDisplay />}
            depositAsset={collateralInfo}
            recieveDollarValue={"0"}
            balance={marketData?.collateralBalance}
            recieveAmount={"0"}
            setMaxBalance={() => {
              setDepositWeiValue(marketData?.collateralBalance || 0n)
            }}
            onValueChange={(value: bigint | undefined) => setDepositWeiValue(value)}
          />
        </div>
        {isDepositAndBorrow && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">Borrow tgUSD</span>
            </div>

            <div>
              <DepositRecieveInput
                displayRecieve={false}
                depositAmount={borrowWeiValue}
                labelDeposit="You borrow"
                depositSelect={<BorrowAssetDisplay />}
                disabled={!canInteract}
                depositAsset={tgUSDInfo}
                balance={0n}
                setMaxBalance={() => {}}
                displayBalance={false}
                onValueChange={(value: bigint | undefined) => {
                  setBorrowWeiValue(value)
                }}
              />
            </div>
          </div>
        )}
        <div>
          <FormButtons actions={{ handleApprove: actionApprove, handleProcess: actionDeposit }} formState={formState} labelProcess="Deposit" />
        </div>
        <div>Detail</div>
      </div>
    </>
  )
}
