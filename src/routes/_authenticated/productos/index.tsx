import { createFileRoute } from '@tanstack/react-router'
import { ProductosPage } from '@/features/productos/pages/productos-page'

export const Route = createFileRoute('/_authenticated/productos/')({
  component: ProductosPage,
})
