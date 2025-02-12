import TgUsdClaimContent from "@/components/products/tg_usd/stake/tg_usd_stake_content"
import { TgUsdStakeProvider } from "@/components/products/tg_usd/stake/tg_usd_stake_context"

export default async function TgUsdStakePage() {
  return (
    <TgUsdStakeProvider>
      <TgUsdClaimContent />
    </TgUsdStakeProvider>
  )
}
