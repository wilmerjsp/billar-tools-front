import { createFileRoute } from '@tanstack/react-router'
import { ComisionesPage } from '@/features/comisiones/pages/comisiones-page'

export const Route = createFileRoute('/_authenticated/comisiones/')({
  component: ComisionesPage,
})
