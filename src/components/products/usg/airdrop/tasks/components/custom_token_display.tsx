import { TokenImage } from "@/components/design_system/structure/token_image"
import { ExistingAsset } from "@/types"

export const LpTaskCustomAssetDisplay = ({ token }: { token: ExistingAsset }) => {
  const tokenList = ["PT sUSDe", "YT sUSDe", "LP sUSDe", "PT USDe", "YT USDe", "LP USDe", "USG", "sUSG"]

  return (
    <>
      {tokenList.some((el) => token.includes(el)) ? (
        <div className="px-1 md:px-2">
          <TokenImage token={token} size={32} className="w-6 md:w-12" />
        </div>
      ) : (
        <TokenImage token={token} size={32} className="w-8 md:w-16" />
      )}
    </>
  )
}
