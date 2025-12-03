import BorderPanel from "./border_panel"
import TokenImage from "./token_image"

export const USGStaticAssetSelector = () => {
  return (
    <BorderPanel className="flex items-center gap-2 bg-select-input px-2.5 py-2">
      <TokenImage token="USG" size={20} />
      <span className="flex flex-col text-sm font-semibold">USG</span>
    </BorderPanel>
  )
}
