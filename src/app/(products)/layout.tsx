import { ReactNode } from "react"
import { RouteManager } from "./components/route-manager"
import { USGProvider } from "@/components/products/usg/usg_context"
import { RootProvider } from "@/components/products/root/root_context"
import { WalletConnexionProvider } from "@/components/products/wallet/wallet_connexion_context"

type ProductLayoutProps = {
  children: ReactNode
  product: string
}

export default function RootLayout({ children }: ProductLayoutProps) {
  return (
    <RootProvider>
      <WalletConnexionProvider>
        <USGProvider>
          <RouteManager>{children}</RouteManager>
        </USGProvider>
      </WalletConnexionProvider>
    </RootProvider>
  )
}
