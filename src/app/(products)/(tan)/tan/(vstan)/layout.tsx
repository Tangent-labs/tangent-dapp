import { VsTanLayoutContent } from "@/components/products/vs_tan/rstan_layout_content"

export default async function VsTanLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <VsTanLayoutContent>{children}</VsTanLayoutContent>
}
