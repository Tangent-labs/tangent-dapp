import BoosterRecordLayout from "../booster_record_layout"
import { BoosterExistingAsset } from "../../booster_type"
import { BoosterRecordServerData } from "../booster_record_controller"
import BoosterDepositPanel from "./booster_deposit_panel"
import { BoosterDepositProvider } from "./booster_deposit_context"

type BoosterRecordDepositProps = {
  id: BoosterExistingAsset
  data: BoosterRecordServerData
}

export default function BoosterDepositPage({ id, data }: BoosterRecordDepositProps) {
  return (
    <BoosterRecordLayout asset={id} assetInfo={data?.assetsInfo} rewardsInfo={data?.rewardsInfo} stakingInfo={data.stakingInfo} sdAssetInfo={data?.sdAssetInfo}>
      <BoosterDepositProvider>
        <BoosterDepositPanel />
      </BoosterDepositProvider>
    </BoosterRecordLayout>
  )
}
