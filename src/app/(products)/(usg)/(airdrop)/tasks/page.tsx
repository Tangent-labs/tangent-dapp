import UsgTasksContent from "@/components/products/usg/airdrop/tasks/usg_tasks_content"
import { UsgTasksProvider } from "@/components/products/usg/airdrop/tasks/usg_tasks_context"

export default async function USGAirdropPage() {
  return (
    <UsgTasksProvider>
      <UsgTasksContent />
    </UsgTasksProvider>
  )
}
