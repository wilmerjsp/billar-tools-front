import { Link } from '@tanstack/react-router'
import { useMesas } from '@/features/mesas/hooks/use-mesas'
import { useWebSocket } from '@/hooks/use-web-socket'
import { cn } from '@/lib/utils'
import { MesaStatus } from '@/types/enums'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const statusColors: Record<MesaStatus, string> = {
  [MesaStatus.DISPONIBLE]: 'bg-green-500',
  [MesaStatus.OCUPADA]: 'bg-red-500',
  [MesaStatus.RESERVADA]: 'bg-yellow-400',
  [MesaStatus.MANTENIMIENTO]: 'bg-gray-400',
}

const statusLabels: Record<MesaStatus, string> = {
  [MesaStatus.DISPONIBLE]: 'Disponible',
  [MesaStatus.OCUPADA]: 'Ocupada',
  [MesaStatus.RESERVADA]: 'Reservada',
  [MesaStatus.MANTENIMIENTO]: 'Mantenimiento',
}

export function MesasMiniMapa() {
  useWebSocket('mesas')
  const { data: mesas, isLoading } = useMesas()

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-medium'>Estado de mesas</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex flex-wrap gap-2'>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className='h-8 w-8 rounded' />
            ))}
          </div>
        ) : (
          <>
            <div className='flex flex-wrap gap-2'>
              {(mesas ?? []).map((mesa) => (
                <Link
                  key={mesa.id}
                  to='/mesas'
                  title={`Mesa ${mesa.numero}${mesa.nombre ? ` — ${mesa.nombre}` : ''}: ${statusLabels[mesa.status]}`}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded text-xs font-bold text-white transition-opacity hover:opacity-75',
                    statusColors[mesa.status]
                  )}
                >
                  {mesa.numero}
                </Link>
              ))}
              {(mesas ?? []).length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  Sin mesas registradas
                </p>
              )}
            </div>
            <div className='mt-4 flex flex-wrap gap-3'>
              {Object.entries(statusLabels).map(([status, label]) => (
                <div key={status} className='flex items-center gap-1.5'>
                  <div
                    className={cn(
                      'h-3 w-3 rounded-sm',
                      statusColors[status as MesaStatus]
                    )}
                  />
                  <span className='text-xs text-muted-foreground'>{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
