import { BorderPanel } from "@/components/design_system/structure/border_panel"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { specialTokensList } from "../../usg/usg_repository"

type StaticCardAssetInputProps = {
  assetName: string
  logoKey: string
}

export const StaticCardAssetInput = ({ assetName, logoKey }: StaticCardAssetInputProps) => {
  return (
    <BorderPanel className="flex h-10 items-center gap-2 bg-select-input px-2.5 py-2">
      {!assetName.includes("/") || specialTokensList.includes(assetName?.substring(0, assetName?.indexOf(" "))) ? (
        <TokenImage token={logoKey} size={20} />
      ) : (
        <TokenImage token={logoKey} size={32} />
      )}
      <span className="flex flex-col text-sm font-semibold">{assetName}</span>
    </BorderPanel>
  )
}
