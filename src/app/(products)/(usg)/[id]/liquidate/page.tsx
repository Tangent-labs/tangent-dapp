import { USGLiquidateProvider } from "@/components/products/usg/record/liquidate/usg_record_liquidate_context"
import USGLiquidatePanel from "@/components/products/usg/record/liquidate/usg_record_liquidate_content"

export default function USGRecordLiquidatePage() {
  return (
    <USGLiquidateProvider>
      <USGLiquidatePanel />
    </USGLiquidateProvider>
  )
}
