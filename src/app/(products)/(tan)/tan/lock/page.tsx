import RsTanLockContent from "@/components/products/vs_tan/lock/rstan_lock_content"
import { RsTanLockProvider } from "@/components/products/vs_tan/lock/rstan_lock_context"

export default function lockTanPositionPage() {
  return (
    <RsTanLockProvider>
      <RsTanLockContent></RsTanLockContent>
    </RsTanLockProvider>
  )
}
