import { VsTanProvider } from "@/components/products/vs_tan/rstan_layout_context"

export default async function TanLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <VsTanProvider>{children}</VsTanProvider>
}
