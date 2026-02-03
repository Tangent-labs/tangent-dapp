import { ExistingAsset } from "@/types"
import TokenImage from "../structure/token_image"
import { specialTokensList } from "@/components/products/usg/usg_repository"

export const CustomAssetDisplay = ({ token }: { token: ExistingAsset }) => {
  return (
    <>
      {specialTokensList.includes(token?.substring(0, token.indexOf(" ")).trim()) ? (
        <div className="px-1 md:px-2">
          <TokenImage token={token} size={32} className="w-6 md:w-10" />
        </div>
      ) : (
        <TokenImage token={token} size={32} className="w-8 md:w-14" />
      )}
    </>
  )
}
