import type { Metadata } from "next"
import { socialMetadata } from "../site_metadata"

const title = "Tangent"
const description =
  "Tangent is a decentralized stablecoin protocol maximizing capital efficiency. Borrow against productive collateral with interest-free option on dedicated markets."

export const metadata: Metadata = {
  title,
  description,
  ...socialMetadata(title, description),
}
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
