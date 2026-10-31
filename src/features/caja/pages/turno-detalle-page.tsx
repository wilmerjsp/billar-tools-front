import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, ClipboardList, Download, FileSpreadsheet, FileText, Sheet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { exportTurnoCSV, exportTurnoExcel, exportTurnoPDF } from '@/lib/export-utils'
import { useTurno, useFacturasTurno, useMovimientosTurno } from '../hooks/use-caja'
import { FacturasListado } from '../components/facturas-listado'
import { MovimientosListado } from '../components/movimientos-listado'

function formatCurrency(value: number | string | undefined): string {
  if (value === undefined || value === null) return '—'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num)
}

function formatFecha(iso: string | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TurnoDetallePage() {
  const navigate = useNavigate()
  const { turnoId } = useParams({ from: '/_authenticated/turnos/$turnoId' })
  const id = parseInt(turnoId, 10)

  const { data: turno, isLoading, isError } = useTurno(id)
  const { data: facturas = [] } = useFacturasTurno(id)
  const { data: movimientos = [] } = useMovimientosTurno(id)

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
        <div className='mb-6 flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate({ to: '/turnos' })}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Volver
          </Button>
          <h2 className='text-2xl font-bold tracking-tight'>
            Detalle del Turno #{id}
          </h2>
          {turno && (
            <div className='ml-auto'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <Download className='mr-2 h-4 w-4' />
                    Descargar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    onClick={() => exportTurnoCSV(turno, facturas, movimientos)}
                  >
                    <FileText className='mr-2 h-4 w-4' />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => void exportTurnoExcel(turno, facturas, movimientos)}
                  >
                    <FileSpreadsheet className='mr-2 h-4 w-4' />
                    Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => exportTurnoPDF(turno, facturas, movimientos)}
                  >
                    <Sheet className='mr-2 h-4 w-4' />
                    PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {isLoading && (
          <div className='space-y-4'>
            <Skeleton className='h-40 w-full' />
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-64 w-full' />
          </div>
        )}

        {isError && (
          <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
            <ClipboardList className='mb-4 h-12 w-12' />
            <p>No se pudo cargar el turno. Intenta de nuevo.</p>
          </div>
        )}

        {turno && (
          <>
            <Card className='mb-6'>
              <CardHeader className='pb-2'>
                <CardTitle className='flex items-center gap-2 text-base'>
                  Turno #{turno.id}
                  {turno.caja_nombre && (
                    <span className='text-muted-foreground font-normal'>
                      — {turno.caja_nombre}
                    </span>
                  )}
                  <Badge
                    variant={!turno.fecha_cierre ? 'default' : 'secondary'}
                    className='ml-auto'
                  >
                    {!turno.fecha_cierre ? 'Activo' : 'Cerrado'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Cajero</span>
                  <span className='font-medium'>
                    {turno.cajero_nombre ?? '—'}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Apertura</span>
                  <span>{formatFecha(turno.fecha_apertura)}</span>
                </div>
                {turno.fecha_cierre && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Cierre</span>
                    <span>{formatFecha(turno.fecha_cierre)}</span>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Monto apertura</span>
                  <span>{formatCurrency(turno.monto_apertura)}</span>
                </div>
                {turno.total_acumulado !== undefined && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Total ventas</span>
                    <span className='font-semibold text-green-600'>
                      {formatCurrency(turno.total_acumulado)}
                    </span>
                  </div>
                )}
                {turno.resumen &&
                  Object.entries(turno.resumen.por_metodo_pago ?? {}).map(
                    ([metodo, monto]) => (
                      <div key={metodo} className='flex justify-between ps-4'>
                        <span className='text-muted-foreground capitalize'>
                          {metodo}
                        </span>
                        <span>{formatCurrency(monto)}</span>
                      </div>
                    )
                  )}
                {turno.resumen && (
                  <>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Ingresos manuales
                      </span>
                      <span>+{formatCurrency(turno.resumen.ingresos_manuales)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Egresos manuales
                      </span>
                      <span>−{formatCurrency(turno.resumen.egresos_manuales)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Efectivo esperado (sistema)
                      </span>
                      <span className='font-medium'>
                        {formatCurrency(turno.resumen.efectivo_esperado)}
                      </span>
                    </div>
                  </>
                )}
                {turno.monto_cierre !== undefined && turno.monto_cierre !== null && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Monto físico</span>
                    <span>{formatCurrency(turno.monto_cierre)}</span>
                  </div>
                )}
                {turno.diferencia !== undefined && turno.diferencia !== null && (
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Diferencia</span>
                    <span
                      className={
                        Number(turno.diferencia) < 0
                          ? 'font-semibold text-destructive'
                          : 'font-semibold text-green-600'
                      }
                    >
                      {formatCurrency(turno.diferencia)}
                    </span>
                  </div>
                )}
                {turno.observaciones && (
                  <div className='flex justify-between gap-4'>
                    <span className='text-muted-foreground'>Observaciones</span>
                    <span className='text-right'>{turno.observaciones}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator className='mb-6' />
            <h3 className='mb-4 text-lg font-semibold'>
              Movimientos de efectivo
            </h3>
            <div className='mb-6'>
              <MovimientosListado turnoId={turno.id} />
            </div>

            <Separator className='mb-6' />
            <h3 className='mb-4 text-lg font-semibold'>Facturas del turno</h3>
            <FacturasListado turnoId={turno.id} />
          </>
        )}
      </Main>
    </>
  )
}
