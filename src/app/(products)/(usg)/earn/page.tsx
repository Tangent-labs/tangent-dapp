import { USGEarnContent } from "@/components/products/usg/earn/usg_earn_content"
import { USGEarnProvider } from "@/components/products/usg/earn/usg_earn_context"

export default async function USGEarnPage() {
  return (
    <USGEarnProvider>
      <USGEarnContent />
    </USGEarnProvider>
  )
}
