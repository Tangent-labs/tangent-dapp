import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "Tangent",
  description: "the tangent DAPP",
}
import { PageHeader } from "@/components/design_system/structure/page_header"
import { MenuSide } from "@/components/products/product_nav/menu_side"
import { ProductKey } from "@/types"
import { ReactNode } from "react"
import { productsData } from "@/components/products/products"
import { getUrlServerSide } from "@/middleware"
import NotFound from "./not-found"
import { NavigationProvider } from "@/components/products/product_nav/navigation_context"
import { cookies } from "next/headers"
import { dappConfig } from "@/dapp_config"
import MenuBarFeature from "@/components/products/product_nav/menu_bar_feature"
import { WalletConnexionProvider } from "@/components/products/wallet/wallet_connexion_context"
import { WalletConnexionButton } from "@/components/products/wallet/Wallet_connexion_button"
import MenuSideToogle from "@/components/products/product_nav/menu_side_toogle"

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
        <NavigationProvider _currentProduct={productData.key} _currentFeature={currentFeature} _currentItem={itemSlug} initialIsOpen={initialIsOpen}>
          <div className="ml-2 mt-2 flex bg-page bg-repeat">
            <div className="absolute lg:relative">
              <MenuSide />
            </div>
            <div className="mr-4 w-full lg:mr-24">
              <div className="flex justify-between max-lg:flex-col">
                <div className="order-2 lg:order-1">
                  <MenuBarFeature />
                </div>
                <div className="order-1 lg:order-2">
                  <div className="flex items-center gap-1">
                    <MenuSideToogle className="lg:hidden" />

                    <WalletConnexionButton />
                  </div>
                </div>
              </div>
              <div className="mb-4 flex content-center">
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
