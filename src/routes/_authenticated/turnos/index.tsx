import { createFileRoute } from '@tanstack/react-router'
import { TurnosCajaPage } from '@/features/caja/pages/turnos-caja-page'

export const Route = createFileRoute('/_authenticated/turnos/')({
  component: TurnosCajaPage,
})
