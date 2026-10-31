import { createFileRoute } from '@tanstack/react-router'
import { BillaresSuperAdminPage } from '@/features/superadmin/billares/pages/billares-page'

export const Route = createFileRoute('/superadmin/billares/')({
  component: BillaresSuperAdminPage,
})
