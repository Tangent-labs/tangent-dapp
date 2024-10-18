"use client"
import { ProductBaseFeature, ProductData } from "@/types"
import Panel from "@/components/design_system/structure/panel"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { MenuSideProductLink } from "./menu_side_product_link"
import { useNavigationContext } from "@/components/pages/navigation_context"
import { useMemo } from "react"

type MenuSideProductProps = {
  isCurrentProduct: boolean
  currentFeature: ProductBaseFeature
  productData: ProductData
}

export function MenuSideProduct({ productData }: MenuSideProductProps) {
  const { currentFeature, currentProduct } = useNavigationContext()
  const isCurrentProduct = useMemo(() => currentProduct === productData.key, [currentFeature])

  return (
    <div key={productData.key}>
      <Panel className={cn("!py-2", isCurrentProduct && "bg-panel-title-gradient")}>
        <a href={`/${productData.url}`} className="hover:bg-clip-text hover:bg-row-tonic flex items-center gap-2">
          <Image width={40} height={40} src={`/medias/product_${productData.key}.png`} alt={productData.name} />
          <span className="hover:text-transparent">{productData.name}</span>
        </a>
      </Panel>
      {isCurrentProduct && (
        <div className="ml-5 border-l  border-gray-400">
          <div className="ml-4 pt-2 flex flex-col gap-2 an-menu-transition">
            <MenuSideProductLink feature="deposit" productData={productData} />
            <MenuSideProductLink feature="withdraw" productData={productData} />
            <MenuSideProductLink feature="claim" productData={productData} />
          </div>
        </div>
      )}
    </div>
  )
}
