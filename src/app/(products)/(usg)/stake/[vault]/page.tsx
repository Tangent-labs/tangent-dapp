import { notFound } from "next/navigation"
import USGStakeContent from "@/components/products/usg/stake/usg_stake_content"
import { USGStakeProvider } from "@/components/products/usg/stake/usg_stake_context"
import { isSavingsVaultKey, SAVINGS_VAULTS } from "@/components/products/usg/stake/savings_vaults"

export const generateStaticParams = () => Object.keys(SAVINGS_VAULTS).map((vault) => ({ vault }))

export default async function SavingsVaultPage({ params }: { params: Promise<{ vault: string }> }) {
  const { vault } = await params
  if (!isSavingsVaultKey(vault)) notFound()

  return (
    <USGStakeProvider vault={vault}>
      <USGStakeContent />
    </USGStakeProvider>
  )
}
