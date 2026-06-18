import { TokenImage } from "@/components/design_system/structure/token_image"

export const LpTaskCustomAssetDisplay = ({ token }: { token: string }) => {
  return (
    <>
      {token === "USG" || token?.includes("sUSG") ? (
        <div className="px-0 md:px-2">
          <TokenImage token={token} size={32} className="w-6 md:w-8" />
        </div>
      ) : (
        <TokenImage token={token} size={32} className="w-8 md:w-12" />
      )}
    </>
  )
}
