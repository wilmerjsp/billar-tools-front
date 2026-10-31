import { createFileRoute } from '@tanstack/react-router'
import { KardexPage } from '@/features/inventario/pages/kardex-page'

export const Route = createFileRoute('/_authenticated/inventario/kardex/$productoId')({
  component: KardexPage,
})
