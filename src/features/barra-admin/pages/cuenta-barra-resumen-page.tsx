import { useRef, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, ClipboardList, Printer, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { cn } from '@/lib/utils'
import { loadBillarDisplay } from '@/lib/billar-display-storage'
import { printTicket } from '@/lib/print-ticket'
import type { BarraItemDetalle, EstadoCuentaBarra, EstadoItemBarra } from '../types'
import { useBarraAdminMutations, useCuentaBarraDetalle } from '../hooks/use-barra-admin'
import { TicketCuentaBarra } from '../components/ticket-cuenta-barra'

interface GrupoItemResumen {
  key: string
  producto_id: number
  nombre: string
  status: EstadoItemBarra
  precio_unitario: number
  cantidad: number
  subtotal: number
  notas: string[]
}

function agruparItemsResumen(items: BarraItemDetalle[]): GrupoItemResumen[] {
  const mapa = new Map<string, GrupoItemResumen>()

  for (const item of items) {
    const key = `${item.producto_id}-${item.status}-${item.precio_unitario}`
    const existing = mapa.get(key)
    if (existing) {
      existing.cantidad += item.cantidad
      existing.subtotal += item.cantidad * item.precio_unitario
      if (item.notas && !existing.notas.includes(item.notas)) {
        existing.notas.push(item.notas)
      }
    } else {
      mapa.set(key, {
        key,
        producto_id: item.producto_id,
        nombre: item.producto_nombre_snapshot,
        status: item.status,
        precio_unitario: item.precio_unitario,
        cantidad: item.cantidad,
        subtotal: item.cantidad * item.precio_unitario,
        notas: item.notas ? [item.notas] : [],
      })
    }
  }

  return [...mapa.values()]
}

const estadoCuentaLabels: Record<EstadoCuentaBarra, string> = {
  abierto: 'Abierto',
  cerrado: 'Cerrado',
  facturado: 'Facturado',
}

const estadoCuentaVariant: Record<EstadoCuentaBarra, 'default' | 'secondary' | 'outline'> = {
  abierto: 'default',
  cerrado: 'secondary',
  facturado: 'secondary',
}

const estadoItemClasses: Record<EstadoItemBarra, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  aceptado: 'bg-blue-100 text-blue-800',
  rechazado: 'bg-red-100 text-red-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-gray-100 text-gray-600',
}

const estadoItemLabels: Record<EstadoItemBarra, string> = {
  pendiente: 'Pendiente',
  aceptado: 'Aceptado',
  rechazado: 'Rechazado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatFecha(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function CuentaBarraResumenPage() {
  const navigate = useNavigate()
  const { cuentaId } = useParams({ from: '/_authenticated/barra-admin/historial/$cuentaId' })
  const id = parseInt(cuentaId, 10)

  const { data: cuenta, isLoading, isError } = useCuentaBarraDetalle(id)
  const { cerrarCuentaVacia } = useBarraAdminMutations()
  const [cerrarVaciaOpen, setCerrarVaciaOpen] = useState(false)
  const ticketRef = useRef<HTMLDivElement>(null)

  const grupos = agruparItemsResumen(cuenta?.items ?? [])
  // En el recibo solo van los ítems entregados (los que suman al total)
  const gruposEntregados = grupos.filter((g) => g.status === 'entregado')

  // Vacía = sin ítems activos (los cancelados/rechazados no cuentan)
  const cuentaVacia =
    !!cuenta &&
    cuenta.items.every(
      (i) => i.status === 'cancelado' || i.status === 'rechazado'
    )
  const puedeCerrarVacia = !!cuenta && cuenta.status === 'abierto' && cuentaVacia

  function handleCerrarVacia() {
    // Endpoint genérico: cubre cuentas de admins y de meseras
    cerrarCuentaVacia.mutate(
      { id, esAdmin: false },
      {
        onSuccess: () => {
          setCerrarVaciaOpen(false)
          navigate({ to: '/barra-admin/historial' })
        },
        onError: () => setCerrarVaciaOpen(false),
      }
    )
  }
  const unidadesActivas = grupos
    .filter((g) => g.status !== 'rechazado' && g.status !== 'cancelado')
    .reduce((acc, g) => acc + g.cantidad, 0)
  const unidadesTotales = grupos.reduce((acc, g) => acc + g.cantidad, 0)

  const atendidoPor = cuenta?.mesera_nombre ?? cuenta?.admin_nombre ?? '—'

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
            onClick={() => navigate({ to: '/barra-admin/historial' })}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver
          </Button>
          <h2 className='text-2xl font-bold tracking-tight'>
            Cuenta #{id}
          </h2>
          {cuenta && (
            <Badge variant={estadoCuentaVariant[cuenta.status]}>
              {estadoCuentaLabels[cuenta.status]}
            </Badge>
          )}
          <div className='ml-auto flex items-center gap-2'>
            {puedeCerrarVacia && (
              <Button
                variant='outline'
                size='sm'
                className='text-destructive hover:text-destructive'
                disabled={cerrarCuentaVacia.isPending}
                onClick={() => setCerrarVaciaOpen(true)}
              >
                <Trash2 className='mr-1.5 h-4 w-4' />
                Cerrar cuenta vacía
              </Button>
            )}
            {cuenta && gruposEntregados.length > 0 && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => printTicket(ticketRef.current, `Cuenta-${cuenta.id}`)}
              >
                <Printer className='mr-1.5 h-4 w-4' />
                Imprimir recibo
              </Button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className='space-y-4'>
            <Skeleton className='h-32 w-full' />
            <Skeleton className='h-24 w-full' />
            <Skeleton className='h-64 w-full' />
          </div>
        )}

        {isError && (
          <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
            <ClipboardList className='mb-4 h-12 w-12' />
            <p>No se pudo cargar el detalle. Intenta de nuevo.</p>
          </div>
        )}

        {cuenta && (
          <>
            {/* Info general */}
            <Card className='mb-6'>
              <CardContent className='pt-4 text-sm space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Descripción</span>
                  <span>{cuenta.descripcion || <span className='italic text-muted-foreground'>Sin descripción</span>}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Atendido por</span>
                  <span>{atendidoPor}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Fecha de apertura</span>
                  <span>{formatFecha(cuenta.fecha_hora)}</span>
                </div>
                {cuenta.turno_caja_id && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Turno de caja</span>
                    <span>#{cuenta.turno_caja_id}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Total */}
            <div className='mb-6'>
              <Card className='border-primary/40 bg-primary/5'>
                <CardHeader className='pb-1'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    Total cuenta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold text-primary'>
                    {formatCurrency(cuenta.total)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Indicador de facturado */}
            {cuenta.status === 'facturado' && (
              <Card className='mb-6 border-green-200 bg-green-50 dark:bg-green-950/20'>
                <CardContent className='pt-4'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle2 className='h-4 w-4 text-green-600' />
                    <p className='text-sm font-semibold text-green-700 dark:text-green-400'>
                      Cuenta facturada
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator className='mb-6' />

            {/* Ítems */}
            <h3 className='mb-4 text-lg font-semibold'>
              Productos ({unidadesActivas}
              {unidadesActivas !== unidadesTotales && (
                <span className='text-sm font-normal text-muted-foreground'>
                  {' '}· {unidadesTotales} total
                </span>
              )}
              )
            </h3>

            {grupos.length === 0 ? (
              <p className='py-8 text-center text-sm text-muted-foreground'>
                No hay productos registrados en esta cuenta.
              </p>
            ) : (
              <div className='space-y-2'>
                {grupos.map((grupo) => (
                  <div
                    key={grupo.key}
                    className={cn(
                      'flex items-center justify-between rounded-lg border px-4 py-3 text-sm',
                      (grupo.status === 'rechazado' || grupo.status === 'cancelado') &&
                        'opacity-50'
                    )}
                  >
                    <div className='space-y-0.5 flex-1'>
                      <p className='font-medium'>{grupo.nombre}</p>
                      <div className='flex items-center gap-2'>
                        <Badge
                          className={cn(
                            'text-xs font-normal',
                            estadoItemClasses[grupo.status] ?? 'bg-gray-100 text-gray-700'
                          )}
                        >
                          {estadoItemLabels[grupo.status] ?? grupo.status}
                        </Badge>
                        {grupo.notas.length > 0 && (
                          <span className='text-xs text-muted-foreground'>
                            {grupo.notas.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center gap-6 ml-4'>
                      <span className='text-muted-foreground text-xs'>
                        {grupo.cantidad} × {formatCurrency(grupo.precio_unitario)}
                      </span>
                      <span className='font-semibold w-24 text-right'>
                        {formatCurrency(grupo.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}

                <div className='flex justify-end pt-2 text-sm'>
                  <span className='text-muted-foreground mr-4'>Total</span>
                  <span className='font-semibold'>{formatCurrency(cuenta.total)}</span>
                </div>
              </div>
            )}
          </>
        )}
      </Main>

      <AlertDialog open={cerrarVaciaOpen} onOpenChange={setCerrarVaciaOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar la cuenta #{id}?</AlertDialogTitle>
            <AlertDialogDescription>
              La cuenta no tiene productos activos, así que se cerrará sin
              generar factura. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCerrarVacia}
              disabled={cerrarCuentaVacia.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {cerrarCuentaVacia.isPending ? 'Cerrando...' : 'Cerrar cuenta'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ticket montado oculto: printTicket copia su HTML a una ventana dedicada */}
      {cuenta && (
        <div style={{ display: 'none' }}>
          <TicketCuentaBarra
            ref={ticketRef}
            cuentaId={cuenta.id}
            atendidoPor={cuenta.mesera_nombre ?? cuenta.admin_nombre}
            descripcion={cuenta.descripcion}
            fechaHora={cuenta.fecha_hora}
            facturada={cuenta.status === 'facturado'}
            items={gruposEntregados.map((g) => ({
              nombre: g.nombre,
              cantidad: g.cantidad,
              precio_unitario: g.precio_unitario,
              subtotal: g.subtotal,
            }))}
            total={cuenta.total}
            negocioNombre={loadBillarDisplay()?.nombre}
          />
        </div>
      )}
    </>
  )
}
