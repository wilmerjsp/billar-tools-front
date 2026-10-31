import { useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ClipboardList,
  FileText,
  Printer,
  Receipt,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { EstadoJuego } from '@/types/enums'
import { printTicket } from '@/lib/print-ticket'
import { useAuthStore } from '@/stores/auth-store'
import { sucursalesService } from '@/features/sucursales/services/sucursales-service'
import { useMesas } from '@/features/mesas/hooks/use-mesas'
import { useJuegoResumen } from '../hooks/use-juegos'
import { FacturarJuegoModal } from '../components/facturar-juego-modal'
import { TicketTermico } from '../components/ticket-termico'
import { imprimirFacturaPDF } from '../utils/imprimir-factura'
import { agruparConsumos } from '../utils/agrupar-consumos'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatFecha(iso: string | undefined | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const estadoBadgeConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  [EstadoJuego.EN_JUEGO]: { label: 'En juego', variant: 'default' },
  [EstadoJuego.PAUSADO]: { label: 'Pausado', variant: 'outline' },
  [EstadoJuego.CERRADO]: { label: 'Cerrado', variant: 'secondary' },
  [EstadoJuego.FINALIZADO]: { label: 'Finalizado', variant: 'secondary' },
  [EstadoJuego.FACTURADO]: { label: 'Facturado', variant: 'secondary' },
}


export function JuegoResumenPage() {
  const navigate = useNavigate()
  const { juegoId } = useParams({ from: '/_authenticated/juegos/$juegoId' })
  const id = parseInt(juegoId, 10)

  const user = useAuthStore((s) => s.auth.user)
  const billarId = user?.billares_asignados[0]

  const { data: resumen, isLoading, isError } = useJuegoResumen(id)
  const { data: mesasData } = useMesas()
  const { data: billar } = useQuery({
    queryKey: ['billares', billarId],
    queryFn: () => sucursalesService.getById(billarId!),
    enabled: !!billarId,
    staleTime: 1000 * 60 * 5,
  })
  const [facturarOpen, setFacturarOpen] = useState(false)

  const mesaNumero =
    mesasData?.find((m) => m.id === resumen?.mesa_id)?.numero ?? null

  const ticketRef = useRef<HTMLDivElement>(null)
  // Ventana dedicada en lugar de react-to-print: en tablets el iframe oculto
  // hace que se imprima la pantalla en vez del ticket
  const handlePrintTicket = () =>
    printTicket(
      ticketRef.current,
      `Ticket-${resumen?.factura_tiempo?.numero_factura ?? id}`
    )

  const consumosActivos = useMemo(
    () => (resumen?.consumos ?? []).filter((c) => c.status !== 'rechazado' && c.status !== 'cancelado'),
    [resumen?.consumos]
  )

  const consumosAgrupados = useMemo(
    () => agruparConsumos(resumen?.consumos ?? []),
    [resumen?.consumos]
  )

  const puedeFacturar =
    (resumen?.status === EstadoJuego.FINALIZADO || resumen?.status === EstadoJuego.CERRADO) &&
    !resumen?.factura_tiempo

  const estadoCfg = resumen
    ? (estadoBadgeConfig[resumen.status] ?? { label: resumen.status, variant: 'outline' as const })
    : null

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-wrap items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate({ to: '/juegos/historial' })}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver
          </Button>
          <h2 className='text-2xl font-bold tracking-tight'>
            Resumen Juego #{id}
          </h2>
          {resumen && estadoCfg && (
            <Badge variant={estadoCfg.variant} className='ml-1'>
              {estadoCfg.label}
            </Badge>
          )}
          <div className='ml-auto flex items-center gap-2'>
            {resumen && (
              <>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => imprimirFacturaPDF(resumen, mesaNumero, billar?.nombre)}
                >
                  <FileText className='mr-1.5 h-4 w-4' />
                  Factura PDF
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePrintTicket()}
                >
                  <Printer className='mr-1.5 h-4 w-4' />
                  Ticket
                </Button>
              </>
            )}
            {puedeFacturar && (
              <Button onClick={() => setFacturarOpen(true)}>
                <Receipt className='mr-2 h-4 w-4' />
                Registrar cobro
              </Button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className='space-y-4'>
            <Skeleton className='h-40 w-full' />
            <div className='grid gap-4 sm:grid-cols-3'>
              <Skeleton className='h-24' />
              <Skeleton className='h-24' />
              <Skeleton className='h-24' />
            </div>
            <Skeleton className='h-64 w-full' />
          </div>
        )}

        {isError && (
          <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
            <ClipboardList className='mb-4 h-12 w-12' />
            <p>No se pudo cargar el resumen. Intenta de nuevo.</p>
          </div>
        )}

        {resumen && (
          <>
            {/* Info del juego */}
            <Card className='mb-6'>
              <CardContent className='pt-4 text-sm space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Inicio</span>
                  <span>{formatFecha(resumen.hora_inicio)}</span>
                </div>
                {resumen.hora_fin && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Fin</span>
                    <span>{formatFecha(resumen.hora_fin)}</span>
                  </div>
                )}
                {resumen.tiempo_minutos !== null && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Tiempo jugado</span>
                    <span className='flex items-center gap-1 font-medium'>
                      <Clock className='h-3.5 w-3.5' />
                      {resumen.tiempo_minutos} min
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tarjetas de totales */}
            <div className='mb-6 grid gap-4 sm:grid-cols-3'>
              <Card>
                <CardHeader className='pb-1'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    Costo tiempo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold'>
                    {formatCurrency(resumen.costo_tiempo)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='pb-1'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    Total consumos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold'>
                    {formatCurrency(resumen.total_consumos)}
                  </p>
                </CardContent>
              </Card>
              <Card className='border-primary/40 bg-primary/5'>
                <CardHeader className='pb-1'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    Total juego
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold text-primary'>
                    {formatCurrency(resumen.total_juego)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Factura tiempo (si ya fue cobrada) */}
            {resumen.factura_tiempo && (
              <Card className='mb-6 border-green-200 bg-green-50 dark:bg-green-950/20'>
                <CardContent className='pt-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <CheckCircle2 className='h-4 w-4 text-green-600' />
                    <p className='text-sm font-semibold text-green-700 dark:text-green-400'>
                      Juego facturado
                    </p>
                  </div>
                  <div className='text-sm space-y-1'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Factura</span>
                      <span className='font-medium'>{resumen.factura_tiempo.numero_factura}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Método de pago</span>
                      <span className='capitalize'>{resumen.factura_tiempo.metodo_pago}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Fecha</span>
                      <span>{formatFecha(resumen.factura_tiempo.fecha_hora)}</span>
                    </div>
                    <div className='flex justify-between font-semibold'>
                      <span>Total cobrado</span>
                      <span>{formatCurrency(resumen.factura_tiempo.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator className='mb-6' />

            {/* Lista de consumos */}
            <h3 className='mb-4 text-lg font-semibold'>
              Consumos ({consumosAgrupados.length}{' '}
              {consumosAgrupados.length !== consumosActivos.length && (
                <span className='text-sm font-normal text-muted-foreground'>
                  · {consumosActivos.length} ítem{consumosActivos.length !== 1 ? 's' : ''}
                </span>
              )})
            </h3>

            {consumosAgrupados.length === 0 ? (
              <p className='py-8 text-center text-sm text-muted-foreground'>
                No hay consumos registrados en este juego.
              </p>
            ) : (
              <div className='space-y-2'>
                {consumosAgrupados.map((item, idx) => (
                  <div
                    key={idx}
                    className='flex items-center justify-between rounded-lg border px-4 py-3 text-sm'
                  >
                    <div className='space-y-0.5'>
                      <p className='font-medium'>{item.producto_nombre}</p>
                      {item.jugadores.length > 0 && (
                        <p className='text-xs text-muted-foreground'>
                          {item.jugadores.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className='flex items-center gap-6'>
                      <span className='text-muted-foreground text-xs'>
                        {item.cantidad} × {formatCurrency(item.precio_unitario)}
                      </span>
                      <span className='font-semibold w-24 text-right'>
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}

                <div className='flex justify-end pt-2 text-sm'>
                  <span className='text-muted-foreground mr-4'>Total consumos</span>
                  <span className='font-semibold'>
                    {formatCurrency(resumen.total_consumos)}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </Main>

      {id > 0 && (
        <FacturarJuegoModal
          juegoId={id}
          open={facturarOpen}
          onClose={() => setFacturarOpen(false)}
        />
      )}

      {/* Ticket montado oculto: printTicket copia su HTML a una ventana
          dedicada, por lo que display:none no afecta la impresión */}
      <div style={{ display: 'none' }}>
        {resumen && (
          <TicketTermico
            ref={ticketRef}
            resumen={resumen}
            mesaNumero={mesaNumero}
            negocioNombre={billar?.nombre}
          />
        )}
      </div>
    </>
  )
}
