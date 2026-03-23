"use client"

import Image from "next/image"
import { useUSGContext } from "../../usg_context"
import { boostHeaders } from "./usg_boosts_controller"
import { useUsgBoostsContext } from "./usg_boosts_context"
import { useUsgAirdropContext } from "../usg_airdrop_context"
import { BoostsList, boostsListState } from "./components/BoostsList"
import { AirdropSharedHeader } from "../components/airdrop_side_header"
import { ListProvider } from "@/components/design_system/list/list_context"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

export const UsgBoostsContent = () => {
  const { lpUserPoints, voteUserPoints, userBoostFactor } = useUSGContext()

  const { userBoosts, sortBoosts } = useUsgBoostsContext()

  const { isConnected } = useWalletConnexionContext()

  const { setReferralStatus, referralStatus, airdropDataIsLoading, signMessage } = useUsgAirdropContext()

  return (
    <>
      <div className="flex w-full items-stretch justify-between gap-6">
        <ReliefCard className="hidden w-1/2 bg-panel-title-gradient xl:flex">
          <div className="flex items-center justify-center">
            <Image height={140} width={140} src="/medias/logos/boosts.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          </div>
          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Boosts</span>
            <p className="text-[15px]">Boost your points by holding eligible assets or by belonging to selected communities.</p>
          </div>
        </ReliefCard>

        <AirdropSharedHeader
          isConnected={isConnected}
          setReferralStatus={setReferralStatus}
          referralStatus={referralStatus}
          signMessage={signMessage}
          airdropDataIsLoading={airdropDataIsLoading}
          lpUserPoints={lpUserPoints}
          userBoostFactor={userBoostFactor}
          voteUserPoints={voteUserPoints}
        />
      </div>

      <div className="mt-2 flex w-full flex-col xl:mt-0">
        <ListProvider customSort={sortBoosts} _headers={boostHeaders} _rows={userBoosts} _listState={boostsListState}>
          <BoostsList></BoostsList>
        </ListProvider>
      </div>
    </>
  )
}
