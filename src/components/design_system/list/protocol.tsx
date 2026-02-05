import { ExistingAsset } from "@/types"
import BorderPanel from "../structure/border_panel"
import TokenImage from "../structure/token_image"

type ProtocolProps = {
  token: ExistingAsset
  label: string
}

export const Protocol = ({ token }: ProtocolProps) => {
  return (
    <BorderPanel className="flex items-center justify-center gap-1 !rounded-full bg-overlay-panel p-1 text-xs">
      <TokenImage token={token} size={12} />
      {/* <span>{label}</span> */}
    </BorderPanel>
  )
}
