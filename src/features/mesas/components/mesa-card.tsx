import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MesaStatus } from '@/types/enums'
import { type Mesa } from '@/types/models'
import { MesaStatusBadge } from './mesa-status-badge'

interface MesaCardProps {
  mesa: Mesa
  onSelect: (id: number) => void
  isSelected?: boolean
  meseraName?: string
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}h ${String(m).padStart(2, '0')}m`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function MesaCard({
  mesa,
  onSelect,
  isSelected = false,
  meseraName,
}: MesaCardProps) {
  const isOcupada = mesa.status === MesaStatus.OCUPADA

  const initialSeconds = isOcupada && mesa.juego_activo?.hora_inicio
    ? Math.floor((Date.now() - new Date(mesa.juego_activo.hora_inicio).getTime()) / 1000)
    : 0

  const [elapsedSeconds, setElapsedSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (!isOcupada) {
      setElapsedSeconds(0)
      return
    }

    const startSeconds = mesa.juego_activo?.hora_inicio
      ? Math.floor((Date.now() - new Date(mesa.juego_activo.hora_inicio).getTime()) / 1000)
      : 0

    setElapsedSeconds(startSeconds)

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOcupada, mesa.juego_activo?.hora_inicio])

  const handleClick = useCallback(() => {
    onSelect(mesa.id)
  }, [mesa.id, onSelect])

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'border-primary ring-2 ring-primary ring-offset-2',
        isOcupada && 'border-red-200',
        mesa.status === MesaStatus.DISPONIBLE && 'border-green-200'
      )}
      onClick={handleClick}
    >
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-base font-semibold'>
          Mesa {mesa.numero}
          {mesa.nombre && (
            <span className='ml-1 text-sm font-normal text-muted-foreground'>
              ({mesa.nombre})
            </span>
          )}
        </CardTitle>
        <MesaStatusBadge status={mesa.status} />
      </CardHeader>
      <CardContent className='space-y-1'>
        {mesa.tipo && (
          <p className='text-xs capitalize text-muted-foreground'>{mesa.tipo}</p>
        )}
        {isOcupada && (
          <p className='font-mono text-sm font-medium text-red-600'>
            {formatElapsed(elapsedSeconds)}
          </p>
        )}
        {meseraName && (
          <p className='text-xs text-muted-foreground'>
            Mesera: {meseraName}
          </p>
        )}
        {mesa.tarifa_por_hora !== undefined && (
          <p className='text-xs text-muted-foreground'>
            ${mesa.tarifa_por_hora}/hr
          </p>
        )}
      </CardContent>
    </Card>
  )
}
