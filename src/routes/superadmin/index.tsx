import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminDashboardPage } from '@/features/superadmin/dashboard/pages/superadmin-dashboard-page'

export const Route = createFileRoute('/superadmin/')({
  component: SuperAdminDashboardPage,
})
