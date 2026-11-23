import { VsTanSplitContent } from "@/components/products/vs_tan/split/rstan_split_content"
import { VsTanSplitProvider } from "@/components/products/vs_tan/split/rstan_split_context"

export default function splitTanPositionPage() {
  return (
    <VsTanSplitProvider>
      <VsTanSplitContent></VsTanSplitContent>
    </VsTanSplitProvider>
  )
}
