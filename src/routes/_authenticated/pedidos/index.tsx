import { createFileRoute } from '@tanstack/react-router'
import { PedidosPage } from '@/features/pedidos/pages/pedidos-page'

export const Route = createFileRoute('/_authenticated/pedidos/')({
  component: PedidosPage,
})
