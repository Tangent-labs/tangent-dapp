import STanContent from "@/components/products/tan/stan/stan_content"
import { TanStakeProvider } from "@/components/products/tan/stan/stan_context"

export default function lockTanPositionPage() {
  return (
    <TanStakeProvider>
      <STanContent></STanContent>
    </TanStakeProvider>
  )
}
