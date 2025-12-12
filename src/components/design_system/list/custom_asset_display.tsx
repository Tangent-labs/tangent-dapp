import { ExistingAsset } from "@/types"
import TokenImage from "../structure/token_image"

export const CustomAssetDisplay = ({ token }: { token: ExistingAsset }) => {
  return (
    <>
      {token?.substring(0, token.indexOf(" ")) === "USDe" || token?.substring(0, token.indexOf(" ")) === "sUSDe" ? (
        <div className="px-1 md:px-2">
          <TokenImage token={token} size={32} className="w-6 md:w-12" />
        </div>
      ) : (
        <TokenImage token={token} size={32} className="w-8 md:w-16" />
      )}
    </>
  )
}
