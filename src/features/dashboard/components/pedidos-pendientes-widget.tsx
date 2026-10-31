import { Link } from '@tanstack/react-router'
import { ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PedidoStatus } from '@/types/enums'
import { usePedidosPendientes } from '@/features/pedidos/hooks/use-pedidos'

const statusLabels: Partial<Record<PedidoStatus, string>> = {
  [PedidoStatus.PENDIENTE]: 'Pendiente',
  [PedidoStatus.ACEPTADO]: 'En preparación',
}

const statusVariants: Partial<Record<PedidoStatus, string>> = {
  [PedidoStatus.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
  [PedidoStatus.ACEPTADO]: 'bg-blue-100 text-blue-800',
}

interface PedidosPendientesWidgetProps {
  billarId: number
}

export function PedidosPendientesWidget({ billarId }: PedidosPendientesWidgetProps) {
  const { data: pedidos, isLoading } = usePedidosPendientes(billarId)

  const activos = (pedidos ?? []).filter(
    (p) => p.status === PedidoStatus.PENDIENTE || p.status === PedidoStatus.ACEPTADO
  )
  const preview = activos.slice(0, 5)

  return (
    <Card className='flex flex-col'>
      <CardHeader className='flex flex-row items-center justify-between pb-3'>
        <CardTitle className='text-sm font-medium'>Pedidos pendientes</CardTitle>
        <Link
          to='/pedidos'
          className='text-xs text-primary underline-offset-4 hover:underline'
        >
          Ver todos
        </Link>
      </CardHeader>
      <CardContent className='flex-1'>
        {isLoading ? (
          <div className='space-y-2'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='h-10 w-full' />
            ))}
          </div>
        ) : preview.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-muted-foreground'>
            <ShoppingCart className='mb-2 h-8 w-8 opacity-40' />
            <p className='text-sm'>Sin pedidos pendientes</p>
          </div>
        ) : (
          <ul className='space-y-2'>
            {preview.map((pedido) => (
              <li
                key={pedido.id}
                className='flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm'
              >
                <div className='min-w-0'>
                  <p className='truncate font-medium'>
                    {pedido.producto_nombre ?? `Producto #${pedido.producto_id}`}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {pedido.mesa_numero ? `Mesa ${pedido.mesa_numero}` : 'Barra'}
                    {' · '}x{pedido.cantidad}
                  </p>
                </div>
                <Badge
                  className={statusVariants[pedido.status] ?? ''}
                  variant='outline'
                >
                  {statusLabels[pedido.status] ?? pedido.status}
                </Badge>
              </li>
            ))}
            {activos.length > 5 && (
              <li className='pt-1 text-center text-xs text-muted-foreground'>
                +{activos.length - 5} más
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
