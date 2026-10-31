import { createFileRoute } from '@tanstack/react-router'
import { SucursalesPage } from '@/features/sucursales/pages/sucursales-page'

export const Route = createFileRoute('/_authenticated/sucursales/')({
  component: SucursalesPage,
})
