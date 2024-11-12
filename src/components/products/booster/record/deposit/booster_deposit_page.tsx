import BoosterRecordLayout from "../booster_record_layout"
import { BoosterExistingAsset } from "../../booster_type"
import { getBoosterRecordServerData } from "../booster_record_controller"
import BoosterDepositPanel from "./booster_deposit_panel"
import { BoosterDepositProvider } from "./booster_deposit_context"

type BoosterRecordDepositProps = {
  id: BoosterExistingAsset
}

export default async function BoosterDepositPage({ id }: BoosterRecordDepositProps) {
  const data = await getBoosterRecordServerData(id)
  return (
    <BoosterRecordLayout asset={id} assetInfo={data?.assetsInfo} rewardsInfo={data?.rewardsInfo} stakingInfo={data.stakingInfo}>
      <BoosterDepositProvider>
        <BoosterDepositPanel />
      </BoosterDepositProvider>
    </BoosterRecordLayout>
  )
}
