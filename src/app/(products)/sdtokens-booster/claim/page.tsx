import { getBoosterListServerData } from "@/components/products/booster/booster_list/booster_list_controller"
import BoosterClaimContent from "@/components/products/booster/claim/booster_claim_content"
import { BoosterClaimProvider } from "@/components/products/booster/claim/booster_claim_context"

export default async function BoosterHarvextPage() {
  const { assetsInfos, rewardsInfo } = await getBoosterListServerData()
  //AssetDataPriced[]
  return (
    <BoosterClaimProvider rewardsInfo={rewardsInfo} assetsInfos={assetsInfos}>
      <BoosterClaimContent />
    </BoosterClaimProvider>
  )
}
