import { RsTanLockProvider } from "@/components/products/vs_tan/lock/rstan_lock_context"
import RsTanLockContent from "@/components/products/vs_tan/lock/rstan_lock_content"

export default function lockTanPositionPage() {
  return (
    <RsTanLockProvider>
      <RsTanLockContent></RsTanLockContent>
    </RsTanLockProvider>
  )
}
