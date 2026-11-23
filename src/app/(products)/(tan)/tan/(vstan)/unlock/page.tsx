import { VsTanUnlockContent } from "@/components/products/vs_tan/unlock/rstan_unlock_content"
import { VsTanUnlockProvider } from "@/components/products/vs_tan/unlock/rstan_unlock_context"

export default function unlockTanPositionPage() {
  return (
    <VsTanUnlockProvider>
      <VsTanUnlockContent></VsTanUnlockContent>
    </VsTanUnlockProvider>
  )
}
