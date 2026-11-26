"use client"

import Image from "next/image"
import { UI_V2 } from "@/v2/ui"
import { ClaimAirdropPageV2 } from "@/v2/airdrop/claim-airdrop-page"
import { useUSGContext } from "../../usg_context"
import { useUsgAirdropContext } from "../usg_airdrop_context"
import { AirdropSharedHeader } from "../components/airdrop_side_header"
import { useUsgClaimAirdropContext } from "./usg_claim_airdrop_context"
import { ClaimRecap } from "./components/claim_recap"
import { ClaimNotice } from "./components/claim_notice"
import { GhostButton } from "./components/claim_buttons"
import { AirdropDistribution, ClaimDetails } from "./components/claim_panels"
import { Button } from "@/components/design_system/inputs/button"
import { PageHeader } from "@/components/design_system/structure/page_header"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

export default function UsgClaimAirdropContent() {
  if (UI_V2) return <ClaimAirdropPageV2 />
  return <UsgClaimAirdropContentV1 />
}

function UsgClaimAirdropContentV1() {
  const { lpUserPoints, voteUserPoints, userBoostFactor } = useUSGContext()
  const { isConnected: isWalletConnected } = useWalletConnexionContext()
  const { setReferralStatus, referralStatus, airdropDataIsLoading, signMessage } = useUsgAirdropContext()

  const { isLoading, isConnected, address, recipient, allocations, distribution, totalAmount, claimStatus, claimAll, connect } = useUsgClaimAirdropContext()

  const hasAllocation = !!recipient && totalAmount > 0

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex w-full items-stretch justify-between gap-5">
        <PageHeader>
          <Image height={240} width={240} src="/medias/tokens/TAN_airdrop.png" alt="TAN" className="-mx-8 -my-[45px] shrink-0" />

          <div className="flex flex-col items-start justify-center gap-4 px-6">
            <span className="text-5xl font-semibold leading-none">Airdrop</span>
            <p className="text-sm">Check your TAN allocation</p>
          </div>
        </PageHeader>

        <AirdropSharedHeader
          isConnected={isWalletConnected}
          setReferralStatus={setReferralStatus}
          referralStatus={referralStatus}
          signMessage={signMessage}
          airdropDataIsLoading={airdropDataIsLoading}
          lpUserPoints={lpUserPoints}
          userBoostFactor={userBoostFactor}
          voteUserPoints={voteUserPoints}
        />
      </div>

      {isConnected && !isLoading && (
        <ClaimRecap allocations={allocations} totalAmount={totalAmount} address={address} claimStatus={claimStatus} onClaim={claimAll} />
      )}

      {!isConnected && (
        <ClaimNotice
          title="Connect your wallet"
          description="See your TAN allocation by category and claim it in a single transaction."
          action={<Button label="Connect Wallet" onClick={connect} className="w-full md:w-[168px]" />}
        />
      )}

      {isConnected && !isLoading && !hasAllocation && (
        <ClaimNotice
          title="No TAN allocation for this wallet"
          description="This wallet doesn't have any TAN allocation at the current snapshot."
          action={
            <GhostButton onClick={connect} className="w-full md:w-[140px]">
              Switch wallet
            </GhostButton>
          }
        />
      )}

      {!isLoading &&
        (hasAllocation ? (
          <ClaimDetails allocations={allocations} isClaimed={claimStatus === "claimed"} />
        ) : (
          <AirdropDistribution distribution={distribution} />
        ))}
    </div>
  )
}
