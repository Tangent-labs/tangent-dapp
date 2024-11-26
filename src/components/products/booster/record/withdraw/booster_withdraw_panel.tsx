"use client"

import InputAssetValue from "@/components/design_system/inputs/input_asset_value"
import { useBoosterWithdrawContext } from "./booster_withdraw_context"
import InputSelect, { InputSelectAmountTemplate } from "@/components/design_system/inputs/input_select"
import { Button } from "@/components/design_system/inputs/button"

export default function BoosterWithdrawPanel() {
  const { weiValue, setWeiValue, gaugeAssetInfo, positionInfos, setCurrentPosition, currentPosition, actionWithdraw } = useBoosterWithdrawContext()

  return (
    <>
      {/* <pre>{JSONdebug(onChainData)}</pre>*/}
      <div>Withdran</div>
      <InputSelect
        template={InputSelectAmountTemplate}
        className="min-w-[250px]"
        options={positionInfos}
        label="Position"
        value={currentPosition}
        onChange={(v) => setCurrentPosition(v)}
      />
      <InputAssetValue
        value={weiValue}
        // disabled={!canInteract}
        placeholder="Withdraw amount"
        asset={gaugeAssetInfo}
        onChange={(value: bigint | undefined) => setWeiValue(value)}
        balance={0n}
      />
      <Button onClick={actionWithdraw} label={"Withdraw"}></Button>
    </>
  )
}
