import { USGEarnContent } from "@/components/products/tg_usd/earn/tg_usd_earn_content"
import { USGEarnProvider } from "@/components/products/tg_usd/earn/tg_usd_earn_context"

import mockJson from "./earnMock.json"

export default async function USGEarnPage() {
  return (
    <USGEarnProvider tasks={mockJson?.tasks}>
      <USGEarnContent />
    </USGEarnProvider>
  )
}
