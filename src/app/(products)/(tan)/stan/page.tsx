import StakeTanContent from "@/components/products/rs_tan/stake/stake_tan_content"
import { StakeTanProvider } from "@/components/products/rs_tan/stake/stake_tan_context"

export default async function stakeTanPositionPage() {
  return (
    <StakeTanProvider>
      <StakeTanContent></StakeTanContent>
    </StakeTanProvider>
  )
}
