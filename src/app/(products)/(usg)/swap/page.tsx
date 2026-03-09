import USGSwapContent from "@/components/products/usg/swap/usg_swap_content"
import { USGSwapProvider } from "@/components/products/usg/swap/usg_swap_context"

export default async function USGSwapPage({ searchParams }: { searchParams: { tokenIn?: string; tokenOut?: string } }) {
  const { tokenIn, tokenOut } = await searchParams

  return (
    <USGSwapProvider tokenIn={tokenIn} tokenOut={tokenOut}>
      <USGSwapContent />
    </USGSwapProvider>
  )
}
