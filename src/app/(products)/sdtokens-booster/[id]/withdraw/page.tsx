import { BoosterExistingAsset } from "@/components/products/booster/booster_type"
import BoosterWithdrawPage from "@/components/products/booster/record/withdraw/booster_widthdraw_page"
export default async function Page({ params }: { params: Promise<{ id: BoosterExistingAsset }> }) {
  const id = (await params).id
  return <BoosterWithdrawPage id={id} />
}
