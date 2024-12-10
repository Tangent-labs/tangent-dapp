import { BoosterExistingAsset } from "@/components/products/booster/booster_type"
import { getBoosterRecordServerData } from "@/components/products/booster/record/booster_record_controller"
import BoosterWithdrawPage from "@/components/products/booster/record/withdraw/booster_widthdraw_page"
export default async function Page({ params }: { params: Promise<{ id: BoosterExistingAsset }> }) {
  const id = (await params).id
  const data = await getBoosterRecordServerData(id)
  return <BoosterWithdrawPage id={id} data={data} />
}
