import USGClaimContent from "@/components/products/tg_usd/claim/tg_usd_claim_content"
import { USGClaimProvider } from "@/components/products/tg_usd/claim/tg_usd_claim_context"

export default async function USGClaimPage() {
  return (
    <USGClaimProvider>
      <USGClaimContent />
    </USGClaimProvider>
  )
}
