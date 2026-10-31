import { createFileRoute } from '@tanstack/react-router'
import { AdministradoresSuperAdminPage } from '@/features/superadmin/administradores/pages/administradores-page'

export const Route = createFileRoute('/superadmin/administradores/')({
  component: AdministradoresSuperAdminPage,
})
