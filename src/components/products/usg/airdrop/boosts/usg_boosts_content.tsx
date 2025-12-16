"use client"

import { useUSGContext } from "../../usg_context"
import { boostHeaders } from "./usg_boosts_controller"
import { useUsgBoostsContext } from "./usg_boosts_context"
import { useUsgAirdropContext } from "../usg_airdrop_context"
import { Button } from "@/components/design_system/inputs/button"
import { BoostsList, boostsListState } from "./components/BoostsList"
import { ReferralHeader } from "../referral/components/ReferralHeader"
import { ListProvider } from "@/components/design_system/list/list_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

export const UsgBoostsContent = () => {
  const { lpUserPoints, voteUserPoints } = useUSGContext()

  const { userBoosts, sortBoosts } = useUsgBoostsContext()

  const { isConnected, connect } = useWalletConnexionContext()

  const { airdropDataIsLoading, referralStatus, setReferralStatus, signMessage, userBoost } = useUsgAirdropContext()

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <ReferralHeader
        isLoading={airdropDataIsLoading}
        referralStatus={referralStatus}
        setReferralStatus={setReferralStatus}
        signMessage={signMessage}
        lpUserPoints={lpUserPoints}
        voteUserPoints={voteUserPoints}
        isConnected={isConnected}
        userBoost={userBoost}
      />

      {isConnected && (
        <div className="flex w-full items-start justify-start gap-4">
          <div className="flex w-full flex-col">
            <ListProvider customSort={sortBoosts} _headers={boostHeaders} _rows={userBoosts} _listState={boostsListState}>
              <BoostsList></BoostsList>
            </ListProvider>
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="mt-24 flex min-h-28 w-full flex-col items-center justify-center gap-4">
          <div className="test-sm flex w-full items-center justify-center text-subtitle">Connect your wallet to see you current boosts</div>
          <div className="flex w-56 flex-col items-center justify-center">
            <Button label="Connect wallet" className="flex w-full items-center justify-center" onClick={connect} />
          </div>
        </div>
      )}
    </div>
  )
}
