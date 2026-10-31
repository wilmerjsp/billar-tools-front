import { createFileRoute } from '@tanstack/react-router'
import { SuscripcionesSuperAdminPage } from '@/features/superadmin/suscripciones/pages/suscripciones-page'

export const Route = createFileRoute('/superadmin/suscripciones/')({
  component: SuscripcionesSuperAdminPage,
})
