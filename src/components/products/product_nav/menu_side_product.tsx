"use client"
import { ProductData } from "@/types"
import Panel from "@/components/design_system/structure/panel"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { MenuSideProductLink } from "@/components/products/product_nav/menu_side_product_link"
import { useNavigationContext } from "@/components/products/product_nav/navigation_context"
import { useMemo } from "react"

type MenuSideProductProps = {
  productData: ProductData
  isOpen: boolean
}

export function MenuSideProduct({ productData, isOpen }: MenuSideProductProps) {
  const { currentFeature, currentProduct, navigate } = useNavigationContext()
  const isCurrentProduct = useMemo(() => currentProduct === productData.key, [currentFeature])

  return (
    <div key={productData.key}>
      {isCurrentProduct ? (
        <>
          <Panel className={cn("!py-2", isCurrentProduct && "bg-panel-title-gradient", !isOpen && "border-transparent")}>
            <span
              onClick={() => navigate({ productTo: productData.key, featureTo: "list" })}
              className="flex content-center items-center gap-2 hover:bg-row-tonic hover:bg-clip-text"
            >
              <Image width={30} height={30} src={`/medias/product_${productData.key}_flat.webp`} alt={productData.name} />
              <span className={cn("duration-600 overflow-x-hidden text-nowrap transition-all hover:text-transparent", !isOpen ? "opacity-0" : "opacity-100")}>
                {productData.name}
              </span>
            </span>
          </Panel>
          <div className={cn("ml-5 border-l border-gray-400", !isOpen && "hidden")}>
            <div className={cn("an-menu-transition ml-4 flex flex-col gap-2 overflow-x-hidden pt-2", !isOpen && "hidden")}>
              {productData.features
                .filter((f) => f.isGlobal)
                .map((f) => (
                  <MenuSideProductLink key={f.key} feature={f.key} productData={productData} />
                ))}
            </div>
          </div>
        </>
      ) : (
        <div className={cn("px-4 py-2")}>
          <a href={`/${productData.url}`} className="flex content-center items-center gap-2 hover:bg-row-tonic hover:bg-clip-text">
            <Image width={30} height={30} src={`/medias/product_${productData.key}_flat.webp`} alt={productData.name} />
            <span className={cn("duration-600 overflow-x-hidden text-nowrap transition-all hover:text-transparent", !isOpen ? "opacity-0" : "opacity-100")}>
              {productData.name}
            </span>
          </a>
        </div>
      )}
    </div>
  )
}
