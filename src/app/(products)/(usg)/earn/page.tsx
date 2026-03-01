import { USGEarnContent } from "@/components/products/usg/earn/usg_earn_content"
import { USGEarnProvider } from "@/components/products/usg/earn/usg_earn_context"

import { opportunities } from "./aprOpportunities.json"

export default async function USGEarnPage() {
  return (
    <USGEarnProvider tasks={opportunities}>
      <USGEarnContent />
    </USGEarnProvider>
  )
}
