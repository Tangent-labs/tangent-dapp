import { TokenImage } from "@/components/design_system/structure/token_image"

const displaySingleToken = (t: string) => {
  return t === "USG" || t === "sUSG" || t?.includes("sUSG 2026/06/25")
}

export const LpTaskCustomAssetDisplay = ({ token }: { token: string }) => {
  return (
    <>
      {displaySingleToken(token) ? (
        <div className="px-0 md:px-2">
          <TokenImage token={token} size={32} className="w-6 md:w-8" />
        </div>
      ) : (
        <TokenImage token={token} size={32} className="w-8 md:w-12" />
      )}
    </>
  )
}
