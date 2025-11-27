import USGSwapContent from "@/components/products/usg/swap/usg_swap_content"
import { USGSwapProvider } from "@/components/products/usg/swap/usg_swap_context"

export default async function USGSwapPage() {
  return (
    <USGSwapProvider>
      <USGSwapContent />
    </USGSwapProvider>
  )
}
