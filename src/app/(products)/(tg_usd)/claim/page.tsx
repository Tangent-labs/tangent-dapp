import TgUsdClaimContent from "@/components/products/tg_usd/claim/tg_usd_claim_content"
import { TgUsdClaimProvider } from "@/components/products/tg_usd/claim/tg_usd_claim_context"

export default async function TgUsdHarvestPage() {
  return (
    <TgUsdClaimProvider>
      <TgUsdClaimContent />
    </TgUsdClaimProvider>
  )
}
