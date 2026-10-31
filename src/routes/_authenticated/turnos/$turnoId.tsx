import { createFileRoute } from '@tanstack/react-router'
import { TurnoDetallePage } from '@/features/caja/pages/turno-detalle-page'

export const Route = createFileRoute('/_authenticated/turnos/$turnoId')({
  component: TurnoDetallePage,
})
