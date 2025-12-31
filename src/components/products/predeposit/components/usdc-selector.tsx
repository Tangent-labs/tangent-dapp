import BorderPanel from "@/components/design_system/structure/border_panel"
import TokenImage from "@/components/design_system/structure/token_image"
import { ExistingAsset } from "@/types"

type StaticAssetSelectorProps = {
  asset: ExistingAsset
}

export const StaticAssetSelector = ({ asset }: StaticAssetSelectorProps) => {
  return (
    <BorderPanel className="flex items-center gap-2 bg-select-input px-2.5 py-2">
      <TokenImage token={asset} size={20} />
      <span className="flex flex-col text-[15px] font-semibold">{asset}</span>
    </BorderPanel>
  )
}
