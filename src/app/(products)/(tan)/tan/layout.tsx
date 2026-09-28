import { VsTanProvider } from "@/components/products/vs_tan/rstan_layout_context"
import { TanPageHeader } from "@/components/products/vs_tan/tan_page_header"

export default async function TanLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <VsTanProvider>
      <TanPageHeader />
      {children}
    </VsTanProvider>
  )
}
