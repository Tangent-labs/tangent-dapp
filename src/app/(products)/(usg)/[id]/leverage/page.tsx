import USGLeverageContent from "@/components/products/usg/record/leverage/usg_record_leverage_content"
import { USGLeverageProvider } from "@/components/products/usg/record/leverage/usg_record_leverage_context"

export default function USGRecordLeveragePage() {
  return (
    <USGLeverageProvider>
      <USGLeverageContent />
    </USGLeverageProvider>
  )
}
