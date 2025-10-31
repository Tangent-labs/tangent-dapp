"use client"

import { Switch } from "@/components/ui/switch"
import { IconGearWheel } from "@/components/icons/icon_gear_wheel"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import FormButtons from "@/components/design_system/form/form_actions"
import { useUSGLiquidateContext } from "./usg_record_liquidate_context"
import USGLiquidatePanelFull from "./usg_record_liquidate_panel_full"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import USGLiquidatePanelPartial from "./usg_record_liquidate_panel_partial"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

export const USGStaticAssetSelector = () => {
  return (
    <BorderPanel className="flex items-center gap-2 bg-select-input px-2.5 py-2">
      <TokenImage token="USG" size={20} />
      <span className="flex flex-col text-[15px] font-semibold">USG</span>
    </BorderPanel>
  )
}

export default function USGLiquidatePanel() {
  const { actionLiquidate, formState, isFullLiquidation, onChangeIsFullLiquidation, slippage, setSlippage } = useUSGLiquidateContext()

  const { connect } = useWalletConnexionContext()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-subtitle">Liquidate all the position</span>
            <Switch checked={isFullLiquidation} onCheckedChange={(v) => onChangeIsFullLiquidation(v)} />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <BorderPanel className="flex h-[30px] cursor-pointer items-center justify-between rounded-[10px] bg-button-gradient py-2">
                  <span className="w-9 px-2 text-xs text-subtitle"> {slippage}%</span>
                  <button type="button" title="Slippage">
                    <div className="h-[30px] cursor-pointer rounded-[10px] border-l border-white/30 bg-button-gradient p-2 hover:bg-white/20">
                      <IconGearWheel className="h-auto w-[12px] text-row-tonic" />
                    </div>
                  </button>
                </BorderPanel>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="center" sideOffset={8} collisionPadding={16} className="!m-0 !w-56 border-none">
                <div className="rounded-[10px] border-none bg-white bg-opacity-[3%] p-3 backdrop-blur-[60px]">
                  <div className="flex w-full flex-col items-center justify-between gap-2">
                    <div className="flex w-full items-center justify-start">Slippage</div>
                    <input
                      onChange={(e) => setSlippage(Number(e?.target?.value))}
                      value={slippage || 0}
                      placeholder="0.5"
                      type="number"
                      className="w-full rounded-lg border border-white/30 bg-transparent pl-2 focus:outline-none"
                    />
                    <div className="mt-2 flex w-full items-center justify-between gap-2">
                      <ButtonTab onClick={() => setSlippage(0.5)} label={"0.5%"} active={slippage === 0.5} className="rounded-full !px-2 !py-1" />
                      <ButtonTab onClick={() => setSlippage(1)} label={"1.0%"} active={slippage === 1} className="rounded-full !px-2 !py-1" />
                      <ButtonTab onClick={() => setSlippage(2)} label={"2.0%"} active={slippage === 2} className="rounded-full !px-2 !py-1" />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {isFullLiquidation ? <USGLiquidatePanelFull /> : <USGLiquidatePanelPartial />}
      </div>

      <FormButtons connect={connect} actions={{ handleApprove: undefined, handleProcess: actionLiquidate }} formState={formState} labelProcess="Liquidate" />
    </div>
  )
}
