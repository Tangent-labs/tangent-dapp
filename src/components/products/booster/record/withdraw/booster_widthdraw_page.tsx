import BoosterRecordLayout from "../booster_record_layout"
import { BoosterExistingAsset } from "../../booster_type"
import { getBoosterRecordServerData } from "../booster_record_controller"
import BoosterWithdrawPanel from "./booster_withdraw_panel"
import { BoosterWithdrawProvider } from "./booster_withdraw_context"

type BoosterRecordDepositProps = {
  id: BoosterExistingAsset
}

export default async function BoosterWithdrawPage({ id }: BoosterRecordDepositProps) {
  const data = await getBoosterRecordServerData(id)
  return (
    <BoosterRecordLayout asset={id} assetInfo={data?.assetsInfo} rewardsInfo={data?.rewardsInfo} stakingInfo={data.stakingInfo} sdAssetInfo={data.sdAssetInfo}>
      <BoosterWithdrawProvider>
        <BoosterWithdrawPanel />
      </BoosterWithdrawProvider>
    </BoosterRecordLayout>
  )
}
