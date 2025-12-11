"use client"

import FormButtons from "@/components/design_system/form/form_actions"
import { useUSGLiquidateContext } from "./usg_record_liquidate_context"
import USGLiquidatePanelFull from "./usg_record_liquidate_panel_full"
import USGLiquidatePanelPartial from "./usg_record_liquidate_panel_partial"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

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
