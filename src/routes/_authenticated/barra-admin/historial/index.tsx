import { createFileRoute } from '@tanstack/react-router'
import { BarraHistorialPage } from '@/features/barra-admin/pages/barra-historial-page'

export const Route = createFileRoute('/_authenticated/barra-admin/historial/')({
  component: BarraHistorialPage,
})
