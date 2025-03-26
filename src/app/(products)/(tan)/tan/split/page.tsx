import { RsTanSplitContent } from "@/components/products/rs_tan/split/rstan_split_content"
import { RsTanSplitProvider } from "@/components/products/rs_tan/split/rstan_split_context"

export default function splitTanPositionPage() {
  return (
    <RsTanSplitProvider>
      <RsTanSplitContent></RsTanSplitContent>
    </RsTanSplitProvider>
  )
}
