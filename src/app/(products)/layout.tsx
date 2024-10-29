import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "Tangent",
  description: "the tangent DAPP",
}
import { PageHeader } from "@/components/design_system/structure/page_header"
import { MenuSide } from "@/components/design_system/structure/product_nav/menu_side"
import { ProductKey } from "@/types"
import { ReactNode } from "react"
import { productsData } from "@/components/products"
import { getUrlServerSide } from "@/middleware"
import NotFound from "./not-found"
import { NavigationProvider } from "@/components/pages/navigation_context"
import { cookies } from "next/headers"
import { dappConfig } from "@/dapp_config"
import MenuBarFeature from "@/components/design_system/structure/product_nav/menu_bar_feature"
import { WalletConnexionProvider } from "@/components/pages/wallet_connexion_context"
import { WalletConnexionButton } from "@/components/products/Wallet_connexion_button"

async function getNavIsOpen() {
  const cookieStore = await cookies()
  if (!cookieStore.has(dappConfig.keyPaths.navIsOpen)) return false
  return JSON.parse(cookieStore.get(dappConfig.keyPaths.navIsOpen)!.value) as boolean
}

type ProductLayoutProps = {
  children: ReactNode
  product: ProductKey
}

export default async function RootLayout({ children }: ProductLayoutProps) {
  const currentUrl = getUrlServerSide()
  const productData = Object.values(productsData).find((p) => currentUrl.startsWith(`/${p.url}`))
  if (!productData) return NotFound()

  const pathParts = currentUrl.split("/").filter(Boolean)
  const [, itemSlug, featureTo] = pathParts

  const isListPage = !itemSlug
  const currentFeature = isListPage ? "list" : !featureTo ? productData.defaultFeature : (featureTo as string)
  // Server side fecth
  const initialIsOpen = await getNavIsOpen()
  return (
    <>
      <WalletConnexionProvider>
        <NavigationProvider _currentProduct={productData.key} _currentFeature={currentFeature} _currentItem={itemSlug}>
          <div className="flex ml-2 gap-6  mt-2 bg-page  bg-repeat">
            <div className="   ">
              <MenuSide initialIsOpen={initialIsOpen} />
            </div>
            <div className="w-full mr-24 ">
              <div className="flex justify-between">
                <MenuBarFeature />
                <div>
                  <WalletConnexionButton />
                </div>
              </div>
              <div className="flex content-center mb-4">
                <PageHeader product={productData!.key} />
              </div>
              <div>{children}</div>
            </div>
          </div>
        </NavigationProvider>
      </WalletConnexionProvider>
    </>
  )
}
