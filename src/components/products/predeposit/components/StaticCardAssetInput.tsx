import { BorderPanel } from "@/components/design_system/structure/border_panel"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { specialTokensList } from "../../usg/usg_repository"
import { UI_V2 } from "@/v2/ui"

type StaticCardAssetInputProps = {
  assetName: string
  logoKey: string
}

export const StaticCardAssetInput = ({ assetName, logoKey }: StaticCardAssetInputProps) => {
  if (UI_V2) {
    const single = !assetName.includes("/") || specialTokensList.includes(assetName?.substring(0, assetName?.indexOf(" ")))
    return (
      <span className="flex h-9 items-center gap-2 rounded-lg bg-white/[0.07] px-2 text-[13px] font-medium">
        <TokenImage token={logoKey} size={single ? 20 : 32} className={single ? "h-5 w-5" : "h-6 w-auto"} />
        {assetName}
      </span>
    )
  }

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
