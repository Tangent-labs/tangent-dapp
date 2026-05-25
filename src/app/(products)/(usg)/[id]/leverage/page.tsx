import { redirect } from "next/navigation"
import USGLeverageContent from "@/components/products/usg/record/leverage/usg_record_leverage_content"
import { USGLeverageProvider } from "@/components/products/usg/record/leverage/usg_record_leverage_context"

export default async function USGRecordLeveragePage({ params }: { params: Promise<{ id: string }> }) {
  if (process.env.NEXT_PUBLIC_IS_LEVERAGE_ON !== "true") {
    const { id } = await params
    redirect(`/${id}/deposit-borrow`)
  }

  return (
    <USGLeverageProvider>
      <USGLeverageContent />
    </USGLeverageProvider>
  )
}
