import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "Tangent",
  description: "the tangent DAPP",
}
import { ToastContainer } from "react-toastify"
import { ReactNode } from "react"
import { WalletConnexionProvider } from "@/components/products/wallet/wallet_connexion_context"
import MenuBarFeature from "@/components/products/product_nav/menu_bar_feature"
import { TgUsdProvider } from "@/components/products/tg_usd/tg_usd_context"
import { fetchTokens } from "@/components/products/tg_usd/tg_usd_controller"
import MobileMenuBarFeature from "@/components/products/product_nav/mobile_menu_bar_feature"

type ProductLayoutProps = {
  children: ReactNode
  product: string
}

export default async function RootLayout({ children }: ProductLayoutProps) {
  const tokens = await fetchTokens()

  return (
    <WalletConnexionProvider>
      <TgUsdProvider tokens={tokens}>
        <ToastContainer position="top-right" autoClose={5000} closeOnClick={true} />
        <MenuBarFeature />
        <div className="container mx-auto mt-2 flex min-h-[80vh] w-full bg-repeat px-4">
          <div className="w-full">{children}</div>
        </div>
        <MobileMenuBarFeature />
      </TgUsdProvider>
    </WalletConnexionProvider>
  )
}
