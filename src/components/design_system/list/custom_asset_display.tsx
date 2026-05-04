import { TokenImage } from "../structure/token_image"
import { specialTokensList } from "@/components/products/usg/usg_repository"

export const CustomAssetDisplay = ({ token }: { token: string }) => {
  return (
    <>
      {specialTokensList.includes(token?.substring(0, token.indexOf(" ")).trim()) || specialTokensList.includes(token) ? (
        <div className="px-0 md:px-2">
          <TokenImage token={token} size={32} className="w-6 md:w-8" />
        </div>
      ) : (
        <TokenImage token={token} size={32} className="w-8 md:w-12" />
      )}
    </>
  )
}
