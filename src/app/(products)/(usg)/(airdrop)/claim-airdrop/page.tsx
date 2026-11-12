import { Address, isAddress } from "viem"
import UsgClaimAirdropContent from "@/components/products/usg/airdrop/claim/usg_claim_airdrop_content"
import { ClaimStatus, UsgClaimAirdropProvider } from "@/components/products/usg/airdrop/claim/usg_claim_airdrop_context"

type ClaimAirdropSearchParams = { previewAddress?: string; previewStatus?: string }

const PREVIEW_STATUSES: ClaimStatus[] = ["idle", "claiming", "claimed"]

export default async function UsgClaimAirdropPage({ searchParams }: { searchParams: Promise<ClaimAirdropSearchParams> }) {
  const { previewAddress, previewStatus } = await searchParams

  return (
    <UsgClaimAirdropProvider
      previewAddress={previewAddress && isAddress(previewAddress) ? (previewAddress as Address) : undefined}
      previewStatus={PREVIEW_STATUSES.includes(previewStatus as ClaimStatus) ? (previewStatus as ClaimStatus) : undefined}
    >
      <UsgClaimAirdropContent />
    </UsgClaimAirdropProvider>
  )
}
