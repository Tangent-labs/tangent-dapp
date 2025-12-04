"use client"

import FormButtons from "@/components/design_system/form/form_actions"
import { useUSGLiquidateContext } from "./usg_record_liquidate_context"
import USGLiquidatePanelFull from "./usg_record_liquidate_panel_full"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import USGLiquidatePanelPartial from "./usg_record_liquidate_panel_partial"
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
  const { actionLiquidate, formState, isFullLiquidation } = useUSGLiquidateContext()

  const { connect } = useWalletConnexionContext()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">{isFullLiquidation ? <USGLiquidatePanelFull /> : <USGLiquidatePanelPartial />}</div>

      <FormButtons connect={connect} actions={{ handleApprove: undefined, handleProcess: actionLiquidate }} formState={formState} labelProcess="Liquidate" />
    </div>
  )
}
