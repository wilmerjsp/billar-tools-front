import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useAlertasStock } from '../hooks/use-inventario'

export function AlertasStockBanner() {
  const { data: alertas, isLoading } = useAlertasStock()

  if (isLoading) {
    return <Skeleton className='mb-4 h-16 w-full' />
  }

  if (!alertas || alertas.length === 0) {
    return null
  }

  return (
    <Alert variant='destructive' className='mb-4'>
      <AlertTriangle className='h-4 w-4' />
      <AlertTitle>Alerta de stock bajo</AlertTitle>
      <AlertDescription>
        <p className='mb-1'>
          Los siguientes productos están por debajo del stock mínimo:
        </p>
        <ul className='ml-2 list-inside list-disc space-y-0.5 text-sm'>
          {alertas.map((alerta) => (
            <li key={alerta.producto_id}>
              <span className='font-medium'>
                {alerta.producto?.nombre ?? `Producto #${alerta.producto_id}`}
              </span>
              {' — '}
              Stock actual:{' '}
              <span className='font-semibold'>{Math.trunc(alerta.stock_actual)}</span>
              {' / '}
              Mínimo:{' '}
              <span className='font-semibold'>{Math.trunc(alerta.stock_minimo)}</span>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
