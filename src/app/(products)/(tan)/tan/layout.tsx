import { VsTanLayoutContent } from "@/components/products/vs_tan/rstan_layout_content"
import { VsTanProvider } from "@/components/products/vs_tan/rstan_layout_context"

export default async function VsTanLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <VsTanProvider>
      <VsTanLayoutContent>{children}</VsTanLayoutContent>
    </VsTanProvider>
  )
}
