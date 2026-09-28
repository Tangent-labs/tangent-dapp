import { USGDashboardUserContent } from "@/components/products/usg/dashboard-user/dashboard_user_content"
import { USGDashboardUserProvider } from "@/components/products/usg/dashboard-user/dashboard_user_context"

export default function USGDashboardUserPage() {
  return (
    <USGDashboardUserProvider>
      <USGDashboardUserContent />
    </USGDashboardUserProvider>
  )
}
