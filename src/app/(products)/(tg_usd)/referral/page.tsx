import { getLeaderboards } from "@/components/products/tg_usd/api"
import { UsgReferralCode } from "@/components/products/tg_usd/referral/usg_referral_content"
import { UsgReferralCodeProvider } from "@/components/products/tg_usd/referral/usg_referral_context"

export default async function UsgReferralCodePage({ searchParams }: { searchParams: { code?: string } }) {
  const { code } = await searchParams

  const { lpLeaderboard, voteLeaderboard } = await getLeaderboards()

  return (
    <UsgReferralCodeProvider code={code} lpLeaderboard={lpLeaderboard} voteLeaderboard={voteLeaderboard}>
      <UsgReferralCode />
    </UsgReferralCodeProvider>
  )
}
