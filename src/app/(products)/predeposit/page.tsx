import { PredepositContent } from "@/components/products/predeposit/predeposit.content"
import { PredepositProvider } from "@/components/products/predeposit/predeposit.context"

export default function PredepositPage() {
  return (
    <PredepositProvider>
      <PredepositContent></PredepositContent>
    </PredepositProvider>
  )
}
