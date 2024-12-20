"use client"
import { ProductData } from "@/types"
import { cn } from "@/lib/utils"
import { useNavigationContext } from "@/components/products/product_nav/navigation_context"

type MenuSideProductLinkProps = {
  feature: string
  productData: ProductData
}

export function MenuSideProductLink({ feature, productData }: MenuSideProductLinkProps) {
  const { currentFeature, currentItem, navigate, getLink, getFeatureData } = useNavigationContext()
  const featureData = getFeatureData(feature)
  return (
    <a
      className="flex items-center gap-3 aria-disabled:cursor-not-allowed aria-disabled:text-gray-700"
      aria-disabled={!currentItem && !featureData.isGlobal}
      href={getLink({ featureTo: feature, productTo: productData.key, itemSlug: currentItem })}
      onClick={(e) => {
        e.preventDefault()
        navigate({ featureTo: feature, productTo: productData.key, itemSlug: currentItem })
      }}
    >
      <div className={cn("mt-1 h-[1px] w-4 border", feature === currentFeature && "border-row-tonic")}></div>
      <span className={cn("capitalize", feature === currentFeature && "text-row-tonic")}>{featureData.label || feature}</span>
    </a>
  )
}
