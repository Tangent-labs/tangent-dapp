import TokenImage from "@/components/design_system/structure/token_image"
import { ExistingAsset } from "@/types"

export const LpTaskCustomAssetDisplay = ({ token }: { token: ExistingAsset }) => {
  return (
    <>
      {token.includes("PT sUSDe") ||
      token.includes("YT sUSDe") ||
      token.includes("LP sUSDe") ||
      token.includes("PT USDe") ||
      token.includes("YT USDe") ||
      token.includes("LP USDe") ||
      token.includes("USG") ||
      token.includes("sUSG") ? (
        <div className="px-1 md:px-2">
          <TokenImage token={token} size={32} className="w-6 md:w-12" />
        </div>
      ) : (
        <TokenImage token={token} size={32} className="w-8 md:w-16" />
      )}
    </>
  )
}
