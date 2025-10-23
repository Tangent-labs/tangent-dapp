import { UsgReferralCode } from "@/components/products/tg_usd/airdrop/referral/usg_referral_content"
import { UsgReferralCodeProvider } from "@/components/products/tg_usd/airdrop/referral/usg_referral_context"
import { getLeaderboards } from "@/components/products/tg_usd/client_api"

export default async function UsgReferralCodePage({ searchParams }: { searchParams: { code?: string } }) {
  const { lpLeaderboard, voteLeaderboard } = await getLeaderboards()

  const { code } = await searchParams

  return (
    <UsgReferralCodeProvider code={code} lpLeaderboard={lpLeaderboard} voteLeaderboard={voteLeaderboard}>
      <UsgReferralCode />
    </UsgReferralCodeProvider>
  )
}
