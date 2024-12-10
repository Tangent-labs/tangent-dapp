import BoosterDepositPage from "@/components/products/booster/record/deposit/booster_deposit_page"
import { BoosterExistingAsset } from "@/components/products/booster/booster_type"

export default async function Page({ params }: { params: Promise<{ id: BoosterExistingAsset }> }) {
  const id = (await params).id
  return <BoosterDepositPage id={id} />
}
