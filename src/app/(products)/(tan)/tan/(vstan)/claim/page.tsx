import { VsTanClaimContent } from "@/components/products/vs_tan/claim/rstan_claim_content"
import { VsTanClaimProvider } from "@/components/products/vs_tan/claim/rstan_claim_context"

export default function claimTanPositionPage() {
  return (
    <VsTanClaimProvider>
      <VsTanClaimContent></VsTanClaimContent>
    </VsTanClaimProvider>
  )
}
