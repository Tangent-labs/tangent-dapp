import { RsTanMergeContent } from "@/components/products/rs_tan/merge/rstan_merge_content"
import { RsTanMergeProvider } from "@/components/products/rs_tan/merge/rstan_merge_context"

export default function mergeTanPositionPage() {
  return (
    <RsTanMergeProvider>
      <RsTanMergeContent></RsTanMergeContent>
    </RsTanMergeProvider>
  )
}
