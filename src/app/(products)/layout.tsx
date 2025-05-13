import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "Tangent",
  description: "the tangent DAPP",
}
import { ToastContainer } from "react-toastify"
import { ReactNode } from "react"
import { WalletConnexionProvider } from "@/components/products/wallet/wallet_connexion_context"
import { WalletConnexionButton } from "@/components/products/wallet/Wallet_connexion_button"
import MenuBarFeature from "@/components/products/product_nav/menu_bar_feature"
import { TgUsdProvider } from "@/components/products/tg_usd/tg_usd_context"
import { fetchTokens } from "@/components/products/tg_usd/tg_usd_controller"

type ProductLayoutProps = {
  children: ReactNode
  product: string
}

export default async function RootLayout({ children }: ProductLayoutProps) {
  const tokens = await fetchTokens()

  return (
    <TgUsdProvider tokens={tokens}>
      <WalletConnexionProvider>
        <ToastContainer position="top-right" autoClose={5000} closeOnClick={true} />
        <div className="ml-2 mt-2 flex bg-repeat">
          <div className="mr-2 w-full lg:mr-24">
            <div className="flex justify-between max-md:flex-col">
              <MenuBarFeature />

              <div className="order-1 flex h-10 items-center justify-center self-center md:order-2">
                <WalletConnexionButton />
              </div>
            </div>
            {children}
          </div>
        </div>
      </WalletConnexionProvider>
    </TgUsdProvider>
  )
}
