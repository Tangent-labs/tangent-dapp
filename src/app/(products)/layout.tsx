import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "Tangent",
  description: "the tangent DAPP",
}

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
import { Button } from "@/components/design_system/inputs/button"

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
  const currentUrl = await getUrlServerSide()

  const pathParts = currentUrl.split("/").filter(Boolean)
  const [productPart, ,] = pathParts
  let itemSlug: string = "",
    featureTo: string = ""
  let productData = Object.values(productsData).find((p) => p.url === productPart)
  if (!productData) {
    itemSlug = pathParts?.at(0) || ""
    featureTo = pathParts?.at(1) || ""
  } else {
    itemSlug = pathParts?.at(1) || ""
    featureTo = pathParts?.at(2) || ""
  }
  productData = productData || productsData.tgUsd

  if (!productData) return NotFound()

  let item: string | undefined = itemSlug

  // We prevent  the claim and harvest  to be considered as itemID
  if (
    productData?.features
      .filter((p) => p.isGlobal)
      .map((p) => p.key)
      .includes(itemSlug)
  ) {
    item = undefined
    featureTo = itemSlug
  }

  const isListPage = !itemSlug && !featureTo
  const currentFeature = isListPage ? "list" : !featureTo ? productData.defaultFeature : (featureTo as string)
  // Server side fecth
  const initialIsOpen = await getNavIsOpen()
  return (
    <>
      <WalletConnexionProvider>
        <NavigationProvider _currentProduct={productData.key} _currentFeature={currentFeature} _currentItem={item} initialIsOpen={initialIsOpen}>
          <div className="ml-2 mt-2 flex bg-repeat">
            <div className="absolute lg:relative">
              <MenuSide />
            </div>
            <div className="mr-2 w-full lg:mr-24">
              <div className="flex justify-between max-md:flex-col">
                <div className="cw-full order-2 flex gap-3 md:order-1">
                  <MenuBarFeature />
                  <Button className="mb-2 px-12 text-sm" label="Buy tgUSD" />
                </div>
                <div className="order-1 md:order-2">
                  <div className="flex items-center gap-1">
                    <MenuSideToogle className="lg:hidden" />
                    <WalletConnexionButton />
                  </div>
                </div>
              </div>

              <div>{children}</div>
            </div>
          </div>
        </NavigationProvider>
      </WalletConnexionProvider>
    </>
  )
}
