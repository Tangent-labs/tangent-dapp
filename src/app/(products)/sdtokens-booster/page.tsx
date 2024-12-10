import { BoosterListProvider } from "@/components/products/booster/booster_list/booster_list_context"
import BoosterList from "@/components/products/booster/booster_list/booster_list"
import { getBoosterListServerData } from "@/components/products/booster/booster_list/booster_list_controller"

const { assetsInfos, rewardsInfo } = await getBoosterListServerData()

const BoosterListPage = async () => {
  return (
    <>
      <BoosterListProvider assetsInfos={assetsInfos} rewardsInfo={rewardsInfo}>
        <BoosterList />
      </BoosterListProvider>
    </>
  )
}

export default BoosterListPage
