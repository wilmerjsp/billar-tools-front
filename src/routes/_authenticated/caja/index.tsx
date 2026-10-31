import { createFileRoute } from '@tanstack/react-router'
import { CajaPage } from '@/features/caja/pages/caja-page'

export const Route = createFileRoute('/_authenticated/caja/')({
  component: CajaPage,
})
