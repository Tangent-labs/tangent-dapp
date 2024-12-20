import { BoosterListProvider } from "@/components/products/booster/booster_list/booster_list_context"
import BoosterList from "@/components/products/booster/booster_list/booster_list"
import { getBoosterListServerData } from "@/components/products/booster/booster_list/booster_list_controller"
import ProductPageHeader from "@/components/products/product_nav/product_page_header"

const { assetsInfos, rewardsInfo } = await getBoosterListServerData()

const BoosterListPage = async () => {
  return (
    <>
      <BoosterListProvider assetsInfos={assetsInfos} rewardsInfo={rewardsInfo}>
        <ProductPageHeader />
        <div>
          <BoosterList />
        </div>
      </BoosterListProvider>
    </>
  )
}

export default BoosterListPage
