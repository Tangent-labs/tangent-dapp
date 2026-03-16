import { BorderPanel } from "@/components/design_system/structure/border_panel"
import { TokenImage } from "@/components/design_system/structure/token_image"

type StaticCardAssetInputProps = {
  assetName: string
  logoKey: string
}

export const StaticCardAssetInput = ({ assetName, logoKey }: StaticCardAssetInputProps) => {
  return (
    <BorderPanel className="flex h-10 items-center gap-2 bg-select-input px-2.5 py-2">
      {!assetName.includes("/") ? (
        <TokenImage token={logoKey} size={20} />
      ) : (
        <div>
          <TokenImage token={logoKey} size={32} />
        </div>
      )}
      <span className="flex flex-col text-sm font-semibold">{assetName}</span>
    </BorderPanel>
  )
}
