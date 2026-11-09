import { Address, isAddress } from "viem"
import UsgClaimAirdropContent from "@/components/products/usg/airdrop/claim/usg_claim_airdrop_content"
import { ClaimStatus, UsgClaimAirdropProvider } from "@/components/products/usg/airdrop/claim/usg_claim_airdrop_context"

type ClaimAirdropSearchParams = { previewAddress?: string; previewStatus?: string }

const PREVIEW_STATUSES: ClaimStatus[] = ["idle", "claiming", "claimed"]

export default async function UsgClaimAirdropPage({ searchParams }: { searchParams: Promise<ClaimAirdropSearchParams> }) {
  const { previewAddress, previewStatus } = await searchParams

  // Dev only: `?previewAddress=0x...&previewStatus=claiming|claimed` renders the page for any wallet of airdrop.json
  const isDev = process.env.NODE_ENV !== "production"

  return (
    <UsgClaimAirdropProvider
      previewAddress={isDev && previewAddress && isAddress(previewAddress) ? (previewAddress as Address) : undefined}
      previewStatus={isDev && PREVIEW_STATUSES.includes(previewStatus as ClaimStatus) ? (previewStatus as ClaimStatus) : undefined}
    >
      <UsgClaimAirdropContent />
    </UsgClaimAirdropProvider>
  )
}
