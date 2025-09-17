"use client"

import { useUSGContext } from "../../tg_usd_context"
import { useUsgBoostsContext } from "./usg_boosts_context"
import { useUsgAirdropContext } from "../usg_airdrop_context"
import { ReferralHeader } from "../referral/components/ReferralHeader"
import { ListProvider } from "@/components/design_system/list/list_context"
import { boostHeaders } from "./usg_boosts_controller"
import { BoostsList, boostsListState } from "./components/BoostsList"

export const UsgBoostsContent = () => {
  const { userBoosts, sortBoosts } = useUsgBoostsContext()

  const { lpUserPoints } = useUSGContext()

  const { isLoading, referralStatus, setReferralStatus, signMessage } = useUsgAirdropContext()

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <ReferralHeader
        isLoading={isLoading}
        referralStatus={referralStatus}
        setReferralStatus={setReferralStatus}
        signMessage={signMessage}
        lpUserPoints={lpUserPoints}
      />

      <div className="flex w-full items-start justify-start gap-4">
        <div className="flex w-full flex-col">
          <ListProvider customSort={sortBoosts} _headers={boostHeaders} _rows={userBoosts} _listState={boostsListState}>
            <BoostsList></BoostsList>
          </ListProvider>
        </div>
      </div>
    </div>
  )
}
