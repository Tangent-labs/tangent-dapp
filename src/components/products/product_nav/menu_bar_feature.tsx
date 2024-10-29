"use client"
import MenuBar, { MenuBarLink } from "@/components/design_system/structure/menu_bar"
import { useNavigationContext } from "@/components/products/product_nav/navigation_context"
import { useMemo } from "react"

export default function MenuBarFeature() {
  const { currentFeature, currentProduct, currentItem, currentProductData: getCurrentProductData, getLink } = useNavigationContext()

  const links = useMemo(() => {
    return getCurrentProductData.features.map((f) => {
      return {
        href: getLink({ featureTo: f.key, productTo: currentProduct, itemSlug: currentItem }),
        label: f.label || f.key,
        disabled: !f.isGlobal && !currentItem,
      } as MenuBarLink
    })
  }, [currentFeature, currentProduct, currentItem])

  return <MenuBar links={links} />
}
