import { TrendingUp, Clock, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useComisionResumen } from '../hooks/use-comisiones'

const COP = (v: number) =>
  Number(v).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })

interface ResumenMeserasProps {
  turnoCajaId?: number
}

export function ResumenMeseras({ turnoCajaId }: ResumenMeserasProps) {
  const { data: resumen, isLoading } = useComisionResumen(
    turnoCajaId ? { turno_caja_id: turnoCajaId } : undefined
  )

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-32 w-full' />
        ))}
      </div>
    )
  }

  if (!resumen || resumen.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        No hay comisiones registradas para este período.
      </p>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {resumen.map((item) => (
        <Card key={item.mesera_id}>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>{item.mesera_nombre}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='flex items-center gap-1 text-muted-foreground'>
                <TrendingUp className='h-3.5 w-3.5' />
                Ventas
              </span>
              <span className='font-medium'>{item.total_ventas}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='flex items-center gap-1 text-muted-foreground'>
                <DollarSign className='h-3.5 w-3.5' />
                Total comisión
              </span>
              <span className='font-semibold text-green-600'>{COP(item.total_comision)}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='flex items-center gap-1 text-muted-foreground'>
                <Clock className='h-3.5 w-3.5' />
                Pendiente
              </span>
              <span
                className={
                  item.comision_pendiente > 0
                    ? 'font-semibold text-amber-600'
                    : 'text-muted-foreground'
                }
              >
                {COP(item.comision_pendiente)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
