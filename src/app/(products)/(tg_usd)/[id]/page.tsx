import { TgUsdDepositProvider } from "@/components/products/tg_usd/record/deposit/tg_usd_record_deposit_context"
import TgUsdDepositPanel from "@/components/products/tg_usd/record/deposit/tg_usd_record_deposit_panel"

export default function TgUsdRecordDepositPage() {
  return (
    <TgUsdDepositProvider>
      <TgUsdDepositPanel />
    </TgUsdDepositProvider>
  )
}
