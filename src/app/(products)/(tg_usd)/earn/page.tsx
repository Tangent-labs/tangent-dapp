import { TgUsdEarnContent } from "@/components/products/tg_usd/earn/tg_usd_earn_content"
import { TgUsdEarnProvider } from "@/components/products/tg_usd/earn/tg_usd_earn_context"

import mockJson from "./earnMock.json"

export default async function TgUsdEarnPage() {
  return (
    <TgUsdEarnProvider tasks={mockJson?.tasks}>
      <TgUsdEarnContent />
    </TgUsdEarnProvider>
  )
}
