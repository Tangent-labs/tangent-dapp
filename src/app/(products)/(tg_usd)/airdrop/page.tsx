import TgUsdAidropContent from "@/components/products/tg_usd/aidrop/tg_usd_airdrop_content"
import { TgUsdAirdropProvider } from "@/components/products/tg_usd/aidrop/tg_usd_airdrop_context"

export default async function TgUsdAirdropPage() {
  return (
    <TgUsdAirdropProvider>
      <TgUsdAidropContent />
    </TgUsdAirdropProvider>
  )
}
