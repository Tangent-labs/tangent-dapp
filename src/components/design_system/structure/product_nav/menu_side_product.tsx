"use client"
import { ProductData } from "@/types"
import Panel from "@/components/design_system/structure/panel"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { MenuSideProductLink } from "./menu_side_product_link"
import { useNavigationContext } from "@/components/pages/navigation_context"
import { useMemo } from "react"

type MenuSideProductProps = {
  productData: ProductData
  isOpen: boolean
}

export function MenuSideProduct({ productData, isOpen }: MenuSideProductProps) {
  const { currentFeature, currentProduct } = useNavigationContext()
  const isCurrentProduct = useMemo(() => currentProduct === productData.key, [currentFeature])

  return (
    <div key={productData.key}>
      {isCurrentProduct ? (
        <>
          <Panel className={cn("!py-2", isCurrentProduct && "bg-panel-title-gradient", !isOpen && "border-transparent !px-1")}>
            <a href={`/${productData.url}`} className="hover:bg-clip-text hover:bg-row-tonic flex content-center items-center gap-2">
              <Image width={40} height={40} src={`/medias/product_${productData.key}.png`} alt={productData.name} />
              <span className={cn("duration-600 text-nowrap overflow-x-hidden transition-all hover:text-transparent ", !isOpen ? "opacity-0" : "opacity-100")}>
                {productData.name}
              </span>
            </a>
          </Panel>
          <div className={cn("ml-5 border-l  border-gray-400", !isOpen && "hidden")}>
            <div className={cn("ml-4 pt-2 flex flex-col gap-2 an-menu-transition overflow-x-hidden", !isOpen && "hidden")}>
              {productData.features.map((f) => (
                <MenuSideProductLink key={f.key} feature={f.key} productData={productData} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className={cn("!py-2")}>
          <a href={`/${productData.url}`} className="hover:bg-clip-text hover:bg-row-tonic flex content-center items-center gap-2">
            <Image width={40} height={40} src={`/medias/product_${productData.key}.png`} alt={productData.name} />
            <span className={cn("duration-600 text-nowrap overflow-x-hidden transition-all hover:text-transparent ", !isOpen ? "opacity-0" : "opacity-100")}>
              {productData.name}
            </span>
          </a>
        </div>
      )}
    </div>
  )
}
