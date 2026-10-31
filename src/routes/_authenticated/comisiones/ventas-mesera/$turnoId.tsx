import { createFileRoute } from '@tanstack/react-router'
import { VentasPorMeseraPage } from '@/features/comisiones/pages/ventas-por-mesera-page'

export const Route = createFileRoute('/_authenticated/comisiones/ventas-mesera/$turnoId')({
  component: VentasPorMeseraPage,
})
