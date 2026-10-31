import { createFileRoute } from '@tanstack/react-router'
import { CuentaBarraResumenPage } from '@/features/barra-admin/pages/cuenta-barra-resumen-page'

export const Route = createFileRoute('/_authenticated/barra-admin/historial/$cuentaId')({
  component: CuentaBarraResumenPage,
})
