import { TokenImage } from "@/components/design_system/structure/token_image"

export const LpTaskCustomAssetDisplay = ({ token }: { token: string }) => {
  const tokenList = ["PT sUSDe", "YT sUSDe", "LP sUSDe", "PT USDe", "YT USDe", "LP USDe", "USG", "sUSG"]

  return (
    <>
      {tokenList.some((el) => token.includes(el)) ? (
        <div className="pr-2">
          <TokenImage token={token} size={32} className="w-6 md:w-10" />
        </div>
      ) : (
        <TokenImage token={token} size={32} className="w-8 md:w-14" />
      )}
    </>
  )
}
