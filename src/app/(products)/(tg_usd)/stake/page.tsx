import USGStakeContent from "@/components/products/tg_usd/stake/tg_usd_stake_content"
import { USGStakeProvider } from "@/components/products/tg_usd/stake/tg_usd_stake_context"

export default async function USGStakePage() {
  return (
    <USGStakeProvider>
      <USGStakeContent />
    </USGStakeProvider>
  )
}
