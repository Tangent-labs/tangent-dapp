import { UsgBoostsContent } from "@/components/products/usg/airdrop/boosts/usg_boosts_content"
import { UsgBoostsProvider } from "@/components/products/usg/airdrop/boosts/usg_boosts_context"

export default async function UsgBoostsPage() {
  return (
    <UsgBoostsProvider>
      <UsgBoostsContent />
    </UsgBoostsProvider>
  )
}
