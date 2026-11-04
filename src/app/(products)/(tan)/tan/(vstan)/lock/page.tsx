import VsTanLockContent from "@/components/products/vs_tan/lock/vstan_lock_content"
import { VsTanLockProvider } from "@/components/products/vs_tan/lock/vstan_lock_context"

export default function lockTanPositionPage() {
  return (
    <VsTanLockProvider>
      <VsTanLockContent></VsTanLockContent>
    </VsTanLockProvider>
  )
}
