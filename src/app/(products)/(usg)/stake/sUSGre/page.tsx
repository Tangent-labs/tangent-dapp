import USGStakeContent from "@/components/products/usg/stake/usg_stake_content"
import { USGStakeProvider } from "@/components/products/usg/stake/usg_stake_context"

export default async function SUSGreStakePage() {
  return (
    <USGStakeProvider vault="sUSG-reUSD">
      <USGStakeContent />
    </USGStakeProvider>
  )
}
