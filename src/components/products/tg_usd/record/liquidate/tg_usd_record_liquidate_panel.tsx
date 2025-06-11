"use client"

import FormButtons from "@/components/design_system/form/form_actions"
import { useTgUsdLiquidateContext } from "./tg_usd_record_liquidate_context"
import { Switch } from "@/components/ui/switch"
import TgUsdLiquidatePanelFull from "./tg_usd_record_liquidate_panel_full"
import TgUsdLiquidatePanelPartial from "./tg_usd_record_liquidate_panel_partial"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { IconGearWheel } from "@/components/icons/icon_gear_wheel"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import Panel from "@/components/design_system/structure/panel"
import { IconChevron } from "@/components/icons/icon_chevron"

export default function TgUsdLiquidatePanel() {
  const { actionLiquidate, formState, isFullLiquidation, onChangeIsFullLiquidation, slippage, setSlippage } = useTgUsdLiquidateContext()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex justify-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Liquidate all the position</span>
            <Switch checked={isFullLiquidation} onCheckedChange={(v) => onChangeIsFullLiquidation(v)} />
          </div>
        </div>
        {isFullLiquidation ? <TgUsdLiquidatePanelFull /> : <TgUsdLiquidatePanelPartial />}
      </div>

      <FormButtons actions={{ handleApprove: undefined, handleProcess: actionLiquidate }} formState={formState} labelProcess="Liquidate" />

      <div className="flex w-full items-end justify-between gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="w-full" title="Slippage">
              <div className="flex h-[30px] w-full cursor-pointer items-center justify-between rounded-xl border border-white/30 px-2 text-xs text-primary hover:bg-white/20">
                Details
                <IconChevron className="h-auto w-[12px] text-row-tonic" />
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="center" sideOffset={8} collisionPadding={16} className="z-20 !m-0 w-96 !border-none bg-black !p-0">
            <Panel className="!border-none">
              <div className="flex w-full flex-col items-center justify-center text-primary">
                {slippage && slippage > 0 ? (
                  <div className="flex w-full items-center justify-between">
                    <div className="flex justify-start">Max slippage</div>
                    <div className="flex justify-end">{slippage}%</div>
                  </div>
                ) : null}

                <div className="flex w-full items-center justify-between">
                  <div className="flex justify-start">Zapping fee</div>
                  <div className="flex justify-end">--</div>
                </div>
              </div>
            </Panel>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <div className="flex h-[30px] cursor-pointer items-center justify-between rounded-xl border border-white/30 bg-button-gradient py-2">
              <span className="w-9 px-2 text-xs text-subtitle"> {slippage}%</span>
              <button type="button" title="Slippage">
                <div className="h-[30px] cursor-pointer rounded-xl border-l border-white/30 bg-button-gradient p-2 hover:bg-white/20">
                  <IconGearWheel className="h-auto w-[12px] text-row-tonic" />
                </div>
              </button>
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="center" sideOffset={8} collisionPadding={16} className="!m-0 !w-56 border-none">
            <div className="rounded-[10px] border-none p-3 backdrop-blur-[60px] backdrop-filter">
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
  )
}
