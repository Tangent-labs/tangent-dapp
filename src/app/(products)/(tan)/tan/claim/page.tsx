import { RsTanClaimContent } from "@/components/products/vs_tan/claim/rstan_claim_content"
import { RsTanClaimProvider } from "@/components/products/vs_tan/claim/rstan_claim_context"

export default function claimTanPositionPage() {
  return (
    <RsTanClaimProvider>
      <RsTanClaimContent></RsTanClaimContent>
    </RsTanClaimProvider>
  )
}
