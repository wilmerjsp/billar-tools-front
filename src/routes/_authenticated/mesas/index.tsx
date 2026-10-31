import { createFileRoute } from '@tanstack/react-router'
import { MesasPage } from '@/features/mesas/pages/mesas-page'

export const Route = createFileRoute('/_authenticated/mesas/')({
  component: MesasPage,
})
