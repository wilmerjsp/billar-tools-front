import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EstadoConsumoItem, EstadoJuego } from '@/types/enums'
import { useMesas } from '@/features/mesas/hooks/use-mesas'
import { useJuego, useJuegoResumen } from '../hooks/use-juegos'
import { estadoConfig } from '../utils/estado-juego-config'
import { FacturarJuegoModal } from './facturar-juego-modal'

interface JuegoDetallePanelProps {
  juegoId: number | null
  onClose: () => void
}

const consumoEstadoConfig: Record<string, { label: string; className: string }> = {
  [EstadoConsumoItem.PENDIENTE]: {
    label: 'Pendiente',
    className: 'bg-yellow-100 text-yellow-800',
  },
  [EstadoConsumoItem.EN_PREPARACION]: {
    label: 'En preparación',
    className: 'bg-blue-100 text-blue-800',
  },
  [EstadoConsumoItem.ENTREGADO]: {
    label: 'Entregado',
    className: 'bg-green-100 text-green-800',
  },
  aceptado: {
    label: 'Aceptado',
    className: 'bg-blue-100 text-blue-800',
  },
  rechazado: {
    label: 'Rechazado',
    className: 'bg-red-100 text-red-800',
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-gray-100 text-gray-600',
  },
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function JuegoDetallePanel({
  juegoId,
  onClose,
}: JuegoDetallePanelProps) {
  const navigate = useNavigate()
  const { data: juego, isLoading } = useJuego(juegoId ?? 0)
  const { data: resumen, isLoading: isResumenLoading } = useJuegoResumen(juegoId ?? 0)
  const { data: mesas } = useMesas()
  const [facturarOpen, setFacturarOpen] = useState(false)

  // El detalle del juego no incluye el número de mesa — resolverlo desde la lista de mesas
  const mesaNumero = juego
    ? (mesas?.find((m) => m.id === juego.mesa_id)?.numero ?? juego.mesa_numero)
    : null

  const puedeFacturar = resumen?.status === EstadoJuego.FINALIZADO
  const estadoCfg = juego ? estadoConfig[juego.estado] : undefined

  return (
    <>
      <Sheet open={juegoId !== null} onOpenChange={(v) => !v && onClose()}>
        <SheetContent className='w-full sm:max-w-lg overflow-y-auto'>
          <SheetHeader>
            <SheetTitle>
              {isLoading
                ? 'Cargando juego...'
                : juego
                  ? `Juego — Mesa ${mesaNumero}`
                  : 'Juego no encontrado'}
            </SheetTitle>
          </SheetHeader>

          {isLoading && (
            <div className='space-y-3 px-4'>
              <Skeleton className='h-6 w-full' />
              <Skeleton className='h-6 w-3/4' />
              <Skeleton className='h-6 w-1/2' />
            </div>
          )}

          {!isLoading && juego && (
            <Tabs defaultValue='detalle' className='px-4 pb-6'>
              <TabsList className='w-full'>
                <TabsTrigger value='detalle' className='flex-1'>Detalle</TabsTrigger>
                <TabsTrigger value='cuenta' className='flex-1'>Cuenta completa</TabsTrigger>
              </TabsList>

              {/* ── Pestaña Detalle ── */}
              <TabsContent value='detalle' className='space-y-6 pt-4'>
                <div className='space-y-1 text-sm'>
                  {juego.mesera_nombre && (
                    <p>
                      <span className='font-medium'>Mesera:</span>{' '}
                      {juego.mesera_nombre}
                    </p>
                  )}
                  <p>
                    <span className='font-medium'>Inicio:</span>{' '}
                    {new Date(juego.inicio).toLocaleString('es-CO')}
                  </p>
                  {juego.tipo_juego && (
                    <p>
                      <span className='font-medium'>Tipo de juego:</span>{' '}
                      <span className='capitalize'>
                        {juego.tipo_juego.replace(/_/g, ' ')}
                      </span>
                    </p>
                  )}
                  <p className='flex items-center gap-2'>
                    <span className='font-medium'>Estado:</span>{' '}
                    {estadoCfg ? (
                      <Badge className={cn('font-medium', estadoCfg.className)}>
                        {estadoCfg.label}
                      </Badge>
                    ) : (
                      <span className='capitalize'>{juego.estado}</span>
                    )}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className='mb-2 font-semibold'>
                    Jugadores ({juego.jugadores.length})
                  </h3>
                  {juego.jugadores.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>
                      Sin jugadores registrados.
                    </p>
                  ) : (
                    <ul className='space-y-2'>
                      {juego.jugadores.map((jugador) => (
                        <li
                          key={jugador.id}
                          className='flex items-center justify-between rounded-md border px-3 py-2 text-sm'
                        >
                          <span>{jugador.nombre}</span>
                          <span className='font-medium'>
                            {formatCurrency(jugador.saldo)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Separator />

                {/* Los consumos vienen del endpoint /resumen — el detalle del juego no los incluye */}
                <div>
                  <h3 className='mb-2 font-semibold'>
                    Consumos{resumen ? ` (${resumen.consumos.length})` : ''}
                  </h3>
                  {isResumenLoading ? (
                    <div className='space-y-2'>
                      <Skeleton className='h-10 w-full' />
                      <Skeleton className='h-10 w-full' />
                    </div>
                  ) : !resumen || resumen.consumos.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>
                      Sin consumos registrados.
                    </p>
                  ) : (
                    <>
                      <ul className='space-y-2'>
                        {resumen.consumos.map((item) => {
                          const consumoCfg = consumoEstadoConfig[item.status]
                          return (
                            <li
                              key={item.consumo_id}
                              className='flex items-start justify-between rounded-md border px-3 py-2 text-sm'
                            >
                              <div className='space-y-1'>
                                <p className='font-medium'>{item.producto_nombre}</p>
                                <p className='text-xs text-muted-foreground'>
                                  {item.cantidad} x {formatCurrency(item.precio_unitario)}
                                </p>
                                {item.jugador_alias && (
                                  <p className='text-xs text-muted-foreground'>
                                    {item.jugador_alias}
                                  </p>
                                )}
                              </div>
                              <div className='flex flex-col items-end gap-1'>
                                <span className='font-medium'>
                                  {formatCurrency(item.subtotal)}
                                </span>
                                {consumoCfg && (
                                  <Badge className={cn('text-xs', consumoCfg.className)}>
                                    {consumoCfg.label}
                                  </Badge>
                                )}
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                      <p className='mt-2 text-right text-sm font-semibold'>
                        Total consumo: {formatCurrency(resumen.total_consumos)}
                      </p>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* ── Pestaña Cuenta completa ── */}
              <TabsContent value='cuenta' className='space-y-6 pt-4'>
                {isResumenLoading ? (
                  <div className='space-y-3'>
                    <Skeleton className='h-6 w-full' />
                    <Skeleton className='h-6 w-3/4' />
                    <Skeleton className='h-6 w-1/2' />
                  </div>
                ) : !resumen ? (
                  <p className='text-sm text-muted-foreground'>
                    No se pudo cargar el resumen.
                  </p>
                ) : (
                  <>
                    {/* Lista de consumos con factura */}
                    <div>
                      <h3 className='mb-2 font-semibold'>
                        Consumos ({resumen.consumos.length})
                      </h3>
                      {resumen.consumos.length === 0 ? (
                        <p className='text-sm text-muted-foreground'>
                          Sin consumos registrados.
                        </p>
                      ) : (
                        <ul className='space-y-2'>
                          {resumen.consumos.map((item) => {
                            const estadoCfg = consumoEstadoConfig[item.status as EstadoConsumoItem]
                            return (
                              <li
                                key={item.consumo_id}
                                className='rounded-md border px-3 py-2 text-sm'
                              >
                                <div className='flex items-start justify-between'>
                                  <div className='space-y-0.5'>
                                    <p className='font-medium'>{item.producto_nombre}</p>
                                    <p className='text-xs text-muted-foreground'>
                                      {item.cantidad} x {formatCurrency(item.precio_unitario)}
                                    </p>
                                    {item.jugador_alias && (
                                      <p className='text-xs text-muted-foreground'>
                                        {item.jugador_alias}
                                      </p>
                                    )}
                                  </div>
                                  <div className='flex flex-col items-end gap-1'>
                                    <span className='font-medium'>
                                      {formatCurrency(item.subtotal)}
                                    </span>
                                    {estadoCfg && (
                                      <Badge className={cn('text-xs', estadoCfg.className)}>
                                        {estadoCfg.label}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {item.factura_numero && (
                                  <p className='mt-1 text-xs text-muted-foreground'>
                                    Factura: {item.factura_numero}
                                  </p>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>

                    <Separator />

                    {/* Totales */}
                    <div className='space-y-1 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Costo tiempo</span>
                        <span>{formatCurrency(resumen.costo_tiempo)}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Subtotal consumos</span>
                        <span>{formatCurrency(resumen.total_consumos)}</span>
                      </div>
                      <Separator className='my-1' />
                      <div className='flex justify-between font-semibold'>
                        <span>Total</span>
                        <span>{formatCurrency(resumen.total_juego)}</span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className='flex items-center justify-between gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          onClose()
                          navigate({ to: '/juegos/$juegoId', params: { juegoId: String(juegoId) } })
                        }}
                      >
                        <ExternalLink className='mr-2 h-4 w-4' />
                        Ver resumen completo
                      </Button>
                      {puedeFacturar && (
                        <Button onClick={() => setFacturarOpen(true)}>
                          Facturar tiempo
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>

      {juegoId !== null && (
        <FacturarJuegoModal
          juegoId={juegoId}
          open={facturarOpen}
          onClose={() => setFacturarOpen(false)}
        />
      )}
    </>
  )
}
