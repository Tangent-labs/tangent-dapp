import { VsTanMergeContent } from "@/components/products/vs_tan/merge/rstan_merge_content"
import { VsTanMergeProvider } from "@/components/products/vs_tan/merge/rstan_merge_context"

export default function mergeTanPositionPage() {
  return (
    <VsTanMergeProvider>
      <VsTanMergeContent></VsTanMergeContent>
    </VsTanMergeProvider>
  )
}
