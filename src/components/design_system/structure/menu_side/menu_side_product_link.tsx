"use client"
import { ProductBaseFeature, ProductData } from "@/types"
import { cn } from "@/lib/utils"
import { useNavigationContext } from "@/components/pages/navigation_context"

type MenuSideProductLinkProps = {
  feature: ProductBaseFeature
  productData: ProductData
}

export function MenuSideProductLink({ feature, productData }: MenuSideProductLinkProps) {
  const { currentFeature, currentItem, navigate, getLink } = useNavigationContext()
  return (
    <a
      className="flex gap-3 items-center aria-disabled:text-gray-700 aria-disabled:cursor-not-allowed"
      aria-disabled={!currentItem && feature !== "claim"}
      href={getLink({ featureTo: feature, productTo: productData.key, itemSlug: currentItem })}
      onClick={(e) => {
        e.preventDefault()
        navigate({ featureTo: feature, productTo: productData.key, itemSlug: currentItem })
      }}
    >
      <div className={cn("w-4 h-[1px] mt-1 border", feature === currentFeature && "border-row-tonic")}></div>
      <span className={cn("capitalize", feature === currentFeature && "text-row-tonic")}>{feature}</span>
    </a>
  )
}
