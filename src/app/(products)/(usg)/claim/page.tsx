import USGClaimContent from "@/components/products/usg/claim/usg_claim_content"
import { USGClaimProvider } from "@/components/products/usg/claim/usg_claim_context"

export default async function USGClaimPage() {
  return (
    <USGClaimProvider>
      <USGClaimContent />
    </USGClaimProvider>
  )
}
