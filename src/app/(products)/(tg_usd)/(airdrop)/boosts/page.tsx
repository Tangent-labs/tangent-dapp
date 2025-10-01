import { UsgBoostsContent } from "@/components/products/tg_usd/airdrop/boosts/usg_boosts_content"
import { UsgBoostsProvider } from "@/components/products/tg_usd/airdrop/boosts/usg_boosts_context"

export default async function UsgBoostsPage() {
  return (
    <UsgBoostsProvider>
      <UsgBoostsContent />
    </UsgBoostsProvider>
  )
}
