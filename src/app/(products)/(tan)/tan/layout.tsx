import { RsTanLayoutContent } from "@/components/products/vs_tan/rstan_layout_content"
import { RsTanProvider } from "@/components/products/vs_tan/rstan_layout_context"

export default async function RsTanLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RsTanProvider>
      <RsTanLayoutContent>{children}</RsTanLayoutContent>
    </RsTanProvider>
  )
}
