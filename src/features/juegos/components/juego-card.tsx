import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { EstadoJuego } from '@/types/enums'
import { type JuegoActivo } from '@/types/models'
import { estadoConfig } from '../utils/estado-juego-config'

interface JuegoCardProps {
  juego: JuegoActivo
  onClick: (id: number) => void
  onRegistrarCobro?: (id: number) => void
}

function formatElapsed(startIso: string): string {
  const diffMs = Date.now() - new Date(startIso).getTime()
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) {
    return `${h}h ${String(m).padStart(2, '0')}m`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function calcularTotalConsumo(juego: JuegoActivo): number {
  return juego.consumos.reduce(
    (acc, item) => acc + item.cantidad * item.precio_unitario,
    0
  )
}

export function JuegoCard({ juego, onClick, onRegistrarCobro }: JuegoCardProps) {
  const [, setTick] = useState(0)

  useEffect(() => {
    if (juego.estado !== EstadoJuego.EN_JUEGO) return

    const interval = setInterval(() => {
      setTick((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [juego.estado])

  const estadoCfg = estadoConfig[juego.estado]
  const totalConsumo = calcularTotalConsumo(juego)
  const esFinalizado = juego.estado === EstadoJuego.FINALIZADO

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        !esFinalizado && 'cursor-pointer'
      )}
      onClick={() => !esFinalizado && onClick(juego.id)}
    >
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-base font-semibold'>
          Mesa {juego.mesa_numero}
        </CardTitle>
        <Badge className={cn('font-medium', estadoCfg.className)}>
          {estadoCfg.label}
        </Badge>
      </CardHeader>
      <CardContent className='space-y-1'>
        {juego.mesera_nombre && (
          <p className='text-xs text-muted-foreground'>
            Mesera: {juego.mesera_nombre}
          </p>
        )}
        <p className='text-xs text-muted-foreground'>
          Inicio: {formatTime(juego.inicio)}
        </p>
        {juego.estado === EstadoJuego.EN_JUEGO && (
          <p className='font-mono text-sm font-medium text-green-600 dark:text-green-400'>
            {formatElapsed(juego.inicio)}
          </p>
        )}
        {esFinalizado && juego.tiempo_minutos !== undefined && (
          <p className='text-xs text-muted-foreground'>
            Tiempo: {juego.tiempo_minutos} min
          </p>
        )}
        {esFinalizado && juego.costo_tiempo !== undefined && (
          <p className='text-sm font-semibold text-amber-700 dark:text-amber-400'>
            Tiempo: {formatCurrency(juego.costo_tiempo)}
          </p>
        )}
        {juego.jugadores.length > 0 && (
          <p className='text-xs text-muted-foreground'>
            Jugadores: {juego.jugadores.length}
          </p>
        )}
        {juego.tipo_juego && (
          <p className='text-xs capitalize text-muted-foreground'>
            Tipo: {juego.tipo_juego.replace(/_/g, ' ')}
          </p>
        )}
        {totalConsumo > 0 && (
          <p className='text-xs font-medium'>
            Consumo: {formatCurrency(totalConsumo)}
          </p>
        )}
        {esFinalizado && onRegistrarCobro && (
          <div className='pt-2'>
            <Button
              size='sm'
              className='w-full'
              onClick={(e) => {
                e.stopPropagation()
                onRegistrarCobro(juego.id)
              }}
            >
              Registrar cobro
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
