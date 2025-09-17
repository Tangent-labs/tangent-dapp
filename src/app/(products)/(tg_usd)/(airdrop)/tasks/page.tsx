import UsgTasksContent from "@/components/products/tg_usd/airdrop/tasks/usg_tasks_content"
import { UsgTasksProvider } from "@/components/products/tg_usd/airdrop/tasks/usg_tasks_context"

export default async function TgUsdAirdropPage() {
  return (
    <UsgTasksProvider>
      <UsgTasksContent />
    </UsgTasksProvider>
  )
}
