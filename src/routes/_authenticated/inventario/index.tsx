import { createFileRoute } from '@tanstack/react-router'
import { InventarioPage } from '@/features/inventario/pages/inventario-page'

export const Route = createFileRoute('/_authenticated/inventario/')({
  component: InventarioPage,
})
