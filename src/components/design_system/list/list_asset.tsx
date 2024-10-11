"use client"
import { ExistingAsset } from "@/types"
import TokenImage from "../structure/token_image"

interface ListAssetProps {
  name: string
  token: ExistingAsset
  assetsEarned?: { token: ExistingAsset }[] // Optional, for cases where you want to display more info
  className?: string
}

const ListAsset = ({ name, token, assetsEarned, className = "" }: ListAssetProps) => {
  return (
    <div className={`flex items-center gap-4  relative ${className}`}>
      <TokenImage token={token} size={50} className=" w-18" />

      <div className="flex flex-col leading-8">
        <span className="text-[32px] font-semibold ">{name}</span>
        {assetsEarned && (
          <>
            <div className="flex gap-2">
              <span className="text-xs ">Earn :</span>
              {assetsEarned.map((earn) => (
                <div key={earn.token} className="flex items-center">
                  <TokenImage token={earn.token} size={20} />
                  <span className="sr-only">{earn.token}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ListAsset
