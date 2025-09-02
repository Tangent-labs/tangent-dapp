import { RsTanUnlockContent } from "@/components/products/vs_tan/unlock/rstan_unlock_content"
import { RsTanUnlockProvider } from "@/components/products/vs_tan/unlock/rstan_unlock_context"

export default function unlockTanPositionPage() {
  return (
    <RsTanUnlockProvider>
      <RsTanUnlockContent></RsTanUnlockContent>
    </RsTanUnlockProvider>
  )
}
