import { createFileRoute } from '@tanstack/react-router'
import { AsignacionesPage } from '@/features/asignaciones/pages/asignaciones-page'

export const Route = createFileRoute('/_authenticated/asignaciones/')({
  component: AsignacionesPage,
})
