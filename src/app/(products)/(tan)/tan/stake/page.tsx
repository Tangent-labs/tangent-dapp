import StakeTanContent from "@/components/products/vs_tan/stake/stake_tan_content"
import { StakeTanProvider } from "@/components/products/vs_tan/stake/stake_tan_context"

export default async function StakeTanPage() {
  return (
    <StakeTanProvider>
      <StakeTanContent />
    </StakeTanProvider>
  )
}
