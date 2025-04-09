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

type ProductLayoutProps = {
  children: ReactNode
  product: string
}

export default async function RootLayout({ children }: ProductLayoutProps) {
  return (
    <>
      <WalletConnexionProvider>
        <div className="ml-2 mt-2 flex bg-repeat">
          <div className="mr-2 w-full lg:mr-24">
            <div className="flex justify-between max-md:flex-col">
              <ToastContainer position="top-right" autoClose={50000} closeOnClick={false} pauseOnFocusLoss draggable pauseOnHover />
              <MenuBarFeature />

              <div className="order-1 md:order-2">
                <WalletConnexionButton />
              </div>
            </div>
            {children}
          </div>
        </div>
      </WalletConnexionProvider>
    </>
  )
}
