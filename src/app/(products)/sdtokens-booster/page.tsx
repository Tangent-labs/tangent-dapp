import { BoosterListProvider } from "@/components/products/booster/booster_list/booster_list_context"
import BoosterList from "@/components/products/booster/booster_list/booster_list"
import { getAssetInfo } from "@/services/service_existing_asset"

const [balInfo, crvInfo, fxnInfo, pendleInfo] = await getAssetInfo(["BAL", "CRV", "FXN", "PENDLE"])

const ExmapleListPage = async () => {
  return (
    <BoosterListProvider infos={[balInfo, crvInfo, fxnInfo, pendleInfo]}>
      <BoosterList />
    </BoosterListProvider>
  )
}

export default ExmapleListPage
