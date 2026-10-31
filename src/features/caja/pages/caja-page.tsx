import { useState } from 'react'
import { toast } from 'sonner'
import { MoreVertical, Pencil, Trash2, Wallet } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { showApiError } from '@/lib/handle-server-error'
import { useAuthStore } from '@/stores/auth-store'
import { usePermissions } from '@/hooks/use-permissions'
import {
  useCajas,
  useEliminarCaja,
  useMiTurnoActivo,
  useResumenTurnoActivo,
  useTurnoActivo,
} from '../hooks/use-caja'
import { AbrirTurnoModal } from '../components/abrir-turno-modal'
import { CerrarTurnoModal } from '../components/cerrar-turno-modal'
import { CrearCajaModal } from '../components/crear-caja-modal'
import { FacturasListado } from '../components/facturas-listado'
import { MovimientoCajaModal } from '../components/movimiento-caja-modal'
import { MovimientosListado } from '../components/movimientos-listado'
import { RenombrarCajaModal } from '../components/renombrar-caja-modal'

function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(isNaN(num) ? 0 : num)
}

function formatFecha(iso: string | undefined): string {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const METODO_PAGO_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  mixto: 'Mixto',
}

export function CajaPage() {
  const { auth } = useAuthStore()
  const { isAdmin } = usePermissions()
  const [selectedCajaId, setSelectedCajaId] = useState<number>(0)
  const [abrirModalOpen, setAbrirModalOpen] = useState(false)
  const [cerrarModalOpen, setCerrarModalOpen] = useState(false)
  const [crearCajaOpen, setCrearCajaOpen] = useState(false)
  const [renombrarOpen, setRenombrarOpen] = useState(false)
  const [eliminarOpen, setEliminarOpen] = useState(false)
  const [movimientoOpen, setMovimientoOpen] = useState(false)

  const {
    data: cajas,
    isLoading: cajasLoading,
    isError: cajasError,
    refetch: refetchCajas,
  } = useCajas()

  const {
    turnos: turnosActivos,
    miTurno,
    isLoading: turnosLoading,
  } = useMiTurnoActivo()

  // El admin ve y cambia entre todas las cajas. El cajero queda fijo en la
  // caja de su turno abierto; sin turno, solo ve las cajas libres para abrir uno.
  const cajasVisibles = isAdmin
    ? (cajas ?? [])
    : miTurno
      ? (cajas ?? []).filter((c) => c.id === miTurno.caja_id)
      : (cajas ?? []).filter(
          (c) => !turnosActivos.some((t) => t.caja_id === c.id)
        )

  const cajaId =
    !isAdmin && miTurno
      ? miTurno.caja_id
      : cajasVisibles.some((c) => c.id === selectedCajaId)
        ? selectedCajaId
        : (cajasVisibles[0]?.id ?? 0)

  const {
    data: turnoActivo,
    isLoading: turnoLoading,
    isError: sinTurno,
  } = useTurnoActivo(cajaId)

  const { data: resumen } = useResumenTurnoActivo(cajaId, !!turnoActivo)

  const eliminarCaja = useEliminarCaja()

  if (cajasLoading || (!isAdmin && turnosLoading)) {
    return (
      <>
        <Header>
          <div className='ms-auto flex items-center space-x-4'>
            <Search />
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <Skeleton className='mb-4 h-8 w-48' />
          <Skeleton className='h-40 w-full' />
        </Main>
      </>
    )
  }

  if (cajasError) {
    return (
      <>
        <Header>
          <div className='ms-auto flex items-center space-x-4'>
            <Search />
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className='flex flex-col items-center gap-4 py-12 text-center'>
            <p className='text-muted-foreground'>
              No se pudieron cargar las cajas.
            </p>
            <Button variant='outline' onClick={() => refetchCajas()}>
              Reintentar
            </Button>
          </div>
        </Main>
      </>
    )
  }

  const cajasDisponibles = cajasVisibles
  const cajaActual = cajasDisponibles.find((c) => c.id === cajaId)

  function handleEliminarCaja() {
    eliminarCaja.mutate(cajaId, {
      onSuccess: () => {
        toast.success('Caja eliminada correctamente')
        setSelectedCajaId(0)
        setEliminarOpen(false)
      },
      onError: (error) => {
        setEliminarOpen(false)
        showApiError(error, 'Error al eliminar la caja')
      },
    })
  }

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>Caja</h1>
          {isAdmin && (
            <Button onClick={() => setCrearCajaOpen(true)}>Crear caja</Button>
          )}
        </div>

        {/* Selector de caja y acciones */}
        {cajasDisponibles.length > 0 && (
          <div className='mb-6 flex items-center gap-2'>
            {cajasDisponibles.length > 1 ? (
              <Select
                value={String(cajaId)}
                onValueChange={(v) => setSelectedCajaId(Number(v))}
              >
                <SelectTrigger className='w-64'>
                  <SelectValue placeholder='Seleccionar caja' />
                </SelectTrigger>
                <SelectContent>
                  {cajasDisponibles.map((caja) => (
                    <SelectItem key={caja.id} value={String(caja.id)}>
                      {caja.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className='text-lg font-medium'>
                {cajaActual?.nombre}
              </span>
            )}

            {isAdmin && cajaActual && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='icon' aria-label='Acciones de caja'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start'>
                  <DropdownMenuItem onClick={() => setRenombrarOpen(true)}>
                    <Pencil className='mr-2 h-4 w-4' />
                    Renombrar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='text-destructive focus:text-destructive'
                    onClick={() => setEliminarOpen(true)}
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        {cajasDisponibles.length === 0 ? (
          <p className='text-muted-foreground'>
            {!isAdmin && (cajas?.length ?? 0) > 0
              ? 'Todas las cajas tienen un turno abierto por otro usuario. Espera a que se libere una caja.'
              : 'No hay cajas disponibles para este billar.'}
          </p>
        ) : (
          <>
            {/* Panel de turno activo */}
            {turnoLoading ? (
              <Card className='mb-6'>
                <CardContent className='p-6'>
                  <Skeleton className='mb-2 h-5 w-40' />
                  <Skeleton className='h-5 w-32' />
                </CardContent>
              </Card>
            ) : sinTurno || !turnoActivo ? (
              <Card className='mb-6 border-dashed'>
                <CardContent className='flex flex-col items-center gap-4 p-6 text-center'>
                  <p className='text-muted-foreground'>
                    No hay un turno activo en{' '}
                    <span className='font-medium text-foreground'>
                      {cajaActual?.nombre ?? 'esta caja'}
                    </span>
                    .
                  </p>
                  <Button onClick={() => setAbrirModalOpen(true)}>
                    Abrir turno
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className='mb-6'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-base'>
                    Turno activo — {turnoActivo.caja_nombre ?? cajaActual?.nombre}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Cajero</span>
                    <span className='font-medium'>
                      {turnoActivo.cajero_nombre || auth.user?.nombre || 'N/A'}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Apertura</span>
                    <span>{formatFecha(turnoActivo.apertura)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Monto inicial</span>
                    <span>{formatCurrency(Number(turnoActivo.monto_apertura) || 0)}</span>
                  </div>

                  {resumen && (
                    <>
                      <Separator className='my-2' />
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          Ventas del turno
                        </span>
                        <span className='font-semibold text-green-600'>
                          {formatCurrency(resumen.total_ingresos)}
                        </span>
                      </div>
                      {Object.entries(resumen.por_metodo_pago ?? {}).map(
                        ([metodo, monto]) => (
                          <div key={metodo} className='flex justify-between ps-4'>
                            <span className='text-muted-foreground'>
                              {METODO_PAGO_LABELS[metodo] ?? metodo}
                            </span>
                            <span>{formatCurrency(monto)}</span>
                          </div>
                        )
                      )}
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          Ingresos manuales
                        </span>
                        <span>+{formatCurrency(resumen.ingresos_manuales)}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          Egresos manuales
                        </span>
                        <span>−{formatCurrency(resumen.egresos_manuales)}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>
                          Comisiones de meseras
                        </span>
                        <span>−{formatCurrency(resumen.total_comisiones)}</span>
                      </div>
                      <div className='flex justify-between border-t pt-2'>
                        <span className='text-muted-foreground'>
                          Efectivo esperado en caja
                        </span>
                        <span className='text-base font-semibold'>
                          {formatCurrency(resumen.efectivo_esperado)}
                        </span>
                      </div>
                    </>
                  )}

                  <div className='flex gap-2 pt-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setMovimientoOpen(true)}
                    >
                      <Wallet className='mr-1 h-4 w-4' />
                      Registrar movimiento
                    </Button>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => setCerrarModalOpen(true)}
                    >
                      Cerrar turno
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Movimientos manuales y facturas del turno */}
            {turnoActivo && (
              <>
                <Separator className='mb-6' />
                <h2 className='mb-4 text-lg font-semibold'>
                  Movimientos de efectivo
                </h2>
                <div className='mb-6'>
                  <MovimientosListado turnoId={turnoActivo.id} />
                </div>

                <Separator className='mb-6' />
                <h2 className='mb-4 text-lg font-semibold'>
                  Facturas del turno
                </h2>
                <FacturasListado turnoId={turnoActivo.id} />
              </>
            )}
          </>
        )}
      </Main>

      <CrearCajaModal
        open={crearCajaOpen}
        onOpenChange={setCrearCajaOpen}
      />

      <RenombrarCajaModal
        open={renombrarOpen}
        onOpenChange={setRenombrarOpen}
        caja={cajaActual}
      />

      <AbrirTurnoModal
        open={abrirModalOpen}
        onOpenChange={setAbrirModalOpen}
        cajaId={cajaId}
      />

      {turnoActivo && (
        <>
          <CerrarTurnoModal
            open={cerrarModalOpen}
            onOpenChange={setCerrarModalOpen}
            cajaId={cajaId}
            turno={turnoActivo}
          />
          <MovimientoCajaModal
            open={movimientoOpen}
            onOpenChange={setMovimientoOpen}
            cajaId={cajaId}
          />
        </>
      )}

      <AlertDialog open={eliminarOpen} onOpenChange={setEliminarOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar la caja "{cajaActual?.nombre}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              La caja dejará de estar disponible, pero su historial de turnos y
              facturas se conserva. No se puede eliminar si tiene un turno
              abierto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminarCaja}
              disabled={eliminarCaja.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {eliminarCaja.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
