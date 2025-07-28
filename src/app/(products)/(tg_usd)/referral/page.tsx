import { UsgReferralCode } from "@/components/products/tg_usd/referral_code/usg_referral_code_content"
import { UsgReferralCodeProvider } from "@/components/products/tg_usd/referral_code/usg_referral_code_context"

export default async function UsgReferralCodePage({ searchParams }: { searchParams: Promise<{ code: string }> }) {
  const { code } = await searchParams

  return (
    <UsgReferralCodeProvider>
      <UsgReferralCode code={code} />
    </UsgReferralCodeProvider>
  )
}
