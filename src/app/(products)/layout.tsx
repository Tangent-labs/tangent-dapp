import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "Tangent",
  description: "the tangent DAPP",
}
import { ReactNode } from "react"
import { RouteManager } from "./components/route-manager"
import { USGProvider } from "@/components/products/usg/usg_context"
import { fetchTokens } from "@/components/products/usg/usg_controller"
import { RootProvider } from "@/components/products/root/root_context"
import { WalletConnexionProvider } from "@/components/products/wallet/wallet_connexion_context"

type ProductLayoutProps = {
  children: ReactNode
  product: string
}

export default async function RootLayout({ children }: ProductLayoutProps) {
  const tokens = await fetchTokens()

  return (
    <RootProvider>
      <WalletConnexionProvider>
        <USGProvider tokens={tokens}>
          <RouteManager>{children}</RouteManager>
        </USGProvider>
      </WalletConnexionProvider>
    </RootProvider>
  )
}
