import { RsTanMergeContent } from "@/components/products/rs_tan/merge/rstan_merge_content"
import { RsTanMergeProvider } from "@/components/products/rs_tan/merge/rstan_merge_context"

export default function MergeTanPositionPage() {
  return (
    <RsTanMergeProvider>
      <RsTanMergeContent></RsTanMergeContent>
    </RsTanMergeProvider>
  )
}
