import { UsgAirdropProvider } from "@/components/products/tg_usd/airdrop/usg_airdrop_context"
import { ReactNode } from "react"

type AirdropLayoutProps = {
  children: ReactNode
}

export default function AirdropLayout({ children }: AirdropLayoutProps) {
  return <UsgAirdropProvider>{children}</UsgAirdropProvider>
}
