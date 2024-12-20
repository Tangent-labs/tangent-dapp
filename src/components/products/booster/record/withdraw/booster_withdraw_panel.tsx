"use client"

import { useBoosterWithdrawContext } from "./booster_withdraw_context"
import InputSelect, { InputSelectAmountTemplate } from "@/components/design_system/inputs/input_select"
import { Button } from "@/components/design_system/inputs/button"
import { useBoosterRecordContext } from "../booster_record_context"
import { DepositRecieveInput } from "@/components/design_system/inputs/deposit_recieve_input"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import TokenImage from "@/components/design_system/structure/token_image"

export default function BoosterWithdrawPanel() {
  const { canInteract } = useWalletConnexionContext()
  const { isProMode, sdAssetInfo } = useBoosterRecordContext()
  const {
    weiValue,
    setWeiValue,
    gaugeAssetInfo,
    positionInfos,
    currentPositionInfo,
    setCurrentPosition,
    recieveAmount,
    currentPosition,
    actionWithdraw,
    recieveDollarValue,
  } = useBoosterWithdrawContext()

  const AssetDisplay = ({ Iswithdrawn }: { Iswithdrawn: boolean }) => {
    if (!sdAssetInfo) return <></>
    return (
      <PanelRaw className="flex w-48 items-center gap-2 border-white !bg-opacity-0 px-4 py-2 !backdrop-blur-none">
        <div className="">
          <TokenImage token={sdAssetInfo.logo} size={35} />
        </div>
        <span className="flex flex-col text-lg leading-3">
          <span>{sdAssetInfo.symbol}</span>
          {Iswithdrawn && <span className="text-xs text-gray-400">gauge</span>}
        </span>
      </PanelRaw>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {isProMode && (
          <InputSelect
            template={InputSelectAmountTemplate}
            className="min-w-[250px]"
            options={positionInfos}
            label="Position"
            value={currentPosition}
            onChange={(v) => setCurrentPosition(v)}
          />
        )}

        <DepositRecieveInput
          labelDeposit="You withdraw"
          labelRecieve="You recieve"
          depositAmount={weiValue}
          depositSelect={<AssetDisplay Iswithdrawn={true} />}
          disabled={!canInteract}
          recieveAssetDisplay={<AssetDisplay Iswithdrawn={false} />}
          depositAsset={gaugeAssetInfo}
          recieveDollarValue={recieveDollarValue}
          balance={currentPositionInfo?.amountBig || 0n}
          recieveAmount={recieveAmount}
          setMaxBalance={() => {
            setWeiValue(currentPositionInfo?.amountBig || 0n)
          }}
          onValueChange={(value: bigint | undefined) => setWeiValue(value)}
        />
        <Button onClick={actionWithdraw} disabled={!canInteract} label={"Withdraw"}></Button>
      </div>
    </>
  )
}
