import { CollateralInfo } from "@/types"
import BorderPanel from "./border_panel"
import TokenImage from "./token_image"

export const CustomCollatAssetDisplay = ({ collateralInfo }: { collateralInfo: CollateralInfo }) => {
  return (
    <BorderPanel className="flex items-center justify-center gap-2 bg-select-input px-2.5 py-2 text-sm">
      {collateralInfo?.logo.includes("USDe") || collateralInfo?.logo.includes("sUSDe") ? (
        <TokenImage token={collateralInfo?.logo} size={20} />
      ) : (
        <TokenImage token={collateralInfo?.logo} size={32} />
      )}
      <div className="font-semibold">{collateralInfo?.symbol}</div>
    </BorderPanel>
  )
}
