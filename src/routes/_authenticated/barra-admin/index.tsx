import { createFileRoute } from '@tanstack/react-router'
import { BarraAdminPage } from '@/features/barra-admin/pages/barra-admin-page'

export const Route = createFileRoute('/_authenticated/barra-admin/')({
  component: BarraAdminPage,
})
