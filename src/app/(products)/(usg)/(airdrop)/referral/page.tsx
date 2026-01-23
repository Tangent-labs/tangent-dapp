import { UsgReferralCode } from "@/components/products/usg/airdrop/referral/usg_referral_content"
import { UsgReferralCodeProvider } from "@/components/products/usg/airdrop/referral/usg_referral_context"

export default async function UsgReferralCodePage({ searchParams }: { searchParams: { code?: string } }) {
  const { code } = await searchParams

  return (
    <UsgReferralCodeProvider code={code}>
      <UsgReferralCode />
    </UsgReferralCodeProvider>
  )
}
