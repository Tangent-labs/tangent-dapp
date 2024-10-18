import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "Tangent",
  description: "the tangent DAPP",
}
import { PageHeader } from "@/components/design_system/structure/page_header"
import { MenuSide } from "@/components/design_system/structure/menu_side/menu_side"
import { ProductBaseFeature, ProductKey } from "@/types"
import { ReactNode } from "react"
import { productsData } from "@/components/products"
import { getUrlServerSide } from "@/middleware"
import NotFound from "./not-found"
import { NavigationProvider } from "@/components/pages/navigation_context"

type ProductLayoutProps = {
  children: ReactNode
  product: ProductKey
}

export default function RootLayout({ children }: ProductLayoutProps) {
  const currentUrl = getUrlServerSide()
  const productData = Object.values(productsData).find((p) => currentUrl.startsWith(`/${p.url}`))
  if (!productData) return NotFound()

  const pathParts = currentUrl.split("/").filter(Boolean)
  const [, itemSlug, featureTo] = pathParts

  const isListPage = !itemSlug
  const currentFeature = isListPage ? "list" : !featureTo ? "deposit" : (featureTo as ProductBaseFeature)

  return (
    <>
      <NavigationProvider _currentProduct={productData.key} _currentFeature={currentFeature} _currentItem={itemSlug}>
        <div className="flex ml-2 gap-6  mt-2">
          <div className=" w-[360px]  ">
            <MenuSide />
          </div>
          <div className="w-full mr-24">
            <div className="flex content-center mb-4">
              <PageHeader product={productData!.key} />
            </div>
            <div>{children}</div>
          </div>
        </div>
      </NavigationProvider>
    </>
  )
}
