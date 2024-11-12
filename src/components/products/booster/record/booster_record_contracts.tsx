import ContractCard from "@/components/design_system/structure/contract_card"
import { useBoosterRecordContext } from "./booster_record_context"
import { TOKEN_ADDR } from "@/services/repo_asset_addresses"
import { BOOSTER_CONTRACT } from "../booster_repository"
import Title from "@/components/design_system/structure/title"

export default function BoosterRecordContract() {
  const { stakingInfo } = useBoosterRecordContext()
  return (
    <div className="flex flex-col gap-6">
      <Title size="normal" label="CONTRACTS" />
      <div className="flex flex-wrap gap-2">
        <ContractCard address={TOKEN_ADDR[stakingInfo.sdAsset]} label={`${stakingInfo.sdAsset} staking`} />
        <ContractCard address={stakingInfo.stakingAddress} label={`${stakingInfo.sdAsset}`} />
        <ContractCard address={stakingInfo.gaugeAsset} label={`${stakingInfo.sdAsset}-Gauge`} />
        <ContractCard address={BOOSTER_CONTRACT.BLACK_HOLE} label="Black hole" />
      </div>
    </div>
  )
}
