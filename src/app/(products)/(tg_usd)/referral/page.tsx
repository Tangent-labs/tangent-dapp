import { UsgReferralCode } from "@/components/products/tg_usd/referral/usg_referral_content"
import { UsgReferralCodeProvider } from "@/components/products/tg_usd/referral/usg_referral_context"

export default async function UsgReferralCodePage({ searchParams }: { searchParams: Promise<{ code: string }> }) {
  const { code } = await searchParams

  return (
    <UsgReferralCodeProvider code={code}>
      <UsgReferralCode />
    </UsgReferralCodeProvider>
  )
}
