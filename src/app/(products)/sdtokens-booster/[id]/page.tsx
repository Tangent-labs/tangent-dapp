import BoosterDepositPage from "@/components/products/booster/record/deposit/booster_deposit_page"
import { BoosterExistingAsset } from "@/components/products/booster/booster_type"
import { getBoosterRecordServerData } from "@/components/products/booster/record/booster_record_controller"

export default async function Page({ params }: { params: Promise<{ id: BoosterExistingAsset }> }) {
  const id = (await params).id
  const data = await getBoosterRecordServerData(id)
  return <BoosterDepositPage id={id} data={data} />
}
