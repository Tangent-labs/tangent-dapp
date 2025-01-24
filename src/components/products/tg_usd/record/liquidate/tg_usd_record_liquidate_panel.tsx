"use client"

import React from "react"

import FormButtons from "@/components/design_system/form/form_actions"
import { useTgUsdLiquidateContext } from "./tg_usd_record_liquidate_context"
import { Switch } from "@/components/ui/switch"
import TgUsdLiquidatePanelFull from "./tg_usd_record_liquidate_panel_full"
import TgUsdLiquidatePanelPartial from "./tg_usd_record_liquidate_panel_partial"

export default function TgUsdLiquidatePanel() {
  const { actionLiquidate, formState, isFullLiquidation, setIsFullLiquidation } = useTgUsdLiquidateContext()
  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex justify-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Liquidate all position</span>
              <Switch checked={isFullLiquidation} onCheckedChange={(v) => setIsFullLiquidation(v)} />
            </div>
          </div>
          {isFullLiquidation ? <TgUsdLiquidatePanelFull /> : <TgUsdLiquidatePanelPartial />}
        </div>

        <div>
          <FormButtons actions={{ handleApprove: undefined, handleProcess: actionLiquidate }} formState={formState} labelProcess="Liquidate" />
        </div>
      </div>
    </>
  )
}
