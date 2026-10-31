import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Eye, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { EstadoJuego } from '@/types/enums'
import { type JuegoHistorialItem } from '@/types/models'
import { cn } from '@/lib/utils'
import { useMesas } from '@/features/mesas/hooks/use-mesas'
import { useHistorialJuegos } from '../hooks/use-juegos'

const estadoLabels: Record<EstadoJuego, string> = {
  [EstadoJuego.EN_JUEGO]: 'En juego',
  [EstadoJuego.PAUSADO]: 'Pausado',
  [EstadoJuego.FINALIZADO]: 'Finalizado',
  [EstadoJuego.FACTURADO]: 'Facturado',
  [EstadoJuego.CERRADO]: 'Cerrado',
}

const estadoClasses: Record<EstadoJuego, string> = {
  [EstadoJuego.EN_JUEGO]: 'bg-blue-100 text-blue-800',
  [EstadoJuego.PAUSADO]: 'bg-yellow-100 text-yellow-800',
  [EstadoJuego.FINALIZADO]: 'bg-orange-100 text-orange-800',
  [EstadoJuego.FACTURADO]: 'bg-green-100 text-green-800',
  [EstadoJuego.CERRADO]: 'bg-gray-100 text-gray-700',
}

function formatCurrency(value: number | null): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuracion(minutos: number | null): string {
  if (minutos === null) return '—'
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function toISOStart(date: string) {
  return date ? `${date}T00:00:00` : undefined
}
function toISOEnd(date: string) {
  return date ? `${date}T23:59:59` : undefined
}

// Columnas mínimas requeridas por useReactTable (el render es manual)
const columns: ColumnDef<JuegoHistorialItem>[] = [
  { id: 'mesa_numero' },
  { id: 'status' },
  { id: 'hora_inicio' },
  { id: 'tiempo_minutos' },
  { id: 'total_juego' },
  { id: 'numero_factura' },
  { id: 'actions' },
]

export function JuegosHistorialPage() {
  const navigate = useNavigate()

  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos')
  const [mesaFiltro, setMesaFiltro] = useState<string>('todas')

  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const [filtrosActivos, setFiltrosActivos] = useState<{
    fecha_desde?: string
    fecha_hasta?: string
    status?: EstadoJuego
    mesa_id?: number
  }>({})

  const { data: mesasData } = useMesas()
  const mesas = mesasData ?? []

  const { data, isLoading, isError } = useHistorialJuegos({
    ...filtrosActivos,
    page: pageIndex + 1,
    page_size: pageSize,
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const pageCount = Math.ceil(total / pageSize)

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === 'function'
          ? updater({ pageIndex, pageSize })
          : updater
      setPageIndex(newState.pageIndex)
      setPageSize(newState.pageSize)
    },
  })

  function aplicarFiltros() {
    setPageIndex(0)
    setFiltrosActivos({
      fecha_desde: toISOStart(fechaDesde),
      fecha_hasta: toISOEnd(fechaHasta),
      status: estadoFiltro !== 'todos' ? (estadoFiltro as EstadoJuego) : undefined,
      mesa_id: mesaFiltro !== 'todas' ? Number(mesaFiltro) : undefined,
    })
  }

  function limpiarFiltros() {
    setFechaDesde('')
    setFechaHasta('')
    setEstadoFiltro('todos')
    setMesaFiltro('todas')
    setPageIndex(0)
    setFiltrosActivos({})
  }

  const hayFiltros =
    fechaDesde || fechaHasta || estadoFiltro !== 'todos' || mesaFiltro !== 'todas'

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
        <div className='mb-6'>
          <h2 className='text-2xl font-bold tracking-tight'>Historial de Juegos</h2>
          <p className='text-sm text-muted-foreground mt-1'>
            Todos los juegos registrados en el sistema
          </p>
        </div>

        {/* Filtros */}
        <div className='mb-6 rounded-lg border bg-card p-4'>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='space-y-1.5'>
              <Label>Fecha desde</Label>
              <Input
                type='date'
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label>Fecha hasta</Label>
              <Input
                type='date'
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label>Mesa</Label>
              <Select value={mesaFiltro} onValueChange={setMesaFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='todas'>Todas</SelectItem>
                  {mesas.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      Mesa {m.numero}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label>Estado</Label>
              <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='todos'>Todos</SelectItem>
                  <SelectItem value={EstadoJuego.EN_JUEGO}>En juego</SelectItem>
                  <SelectItem value={EstadoJuego.PAUSADO}>Pausado</SelectItem>
                  <SelectItem value={EstadoJuego.FINALIZADO}>Finalizado</SelectItem>
                  <SelectItem value={EstadoJuego.FACTURADO}>Facturado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='mt-4 flex items-center gap-2'>
            <Button onClick={aplicarFiltros} size='sm'>
              Buscar
            </Button>
            {hayFiltros && (
              <Button variant='ghost' size='sm' onClick={limpiarFiltros}>
                <X className='mr-1.5 h-3.5 w-3.5' />
                Limpiar filtros
              </Button>
            )}
            {total > 0 && (
              <span className='ml-auto text-sm text-muted-foreground'>
                {total} resultado{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Tabla */}
        {isLoading ? (
          <div className='space-y-2'>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className='h-12 w-full' />
            ))}
          </div>
        ) : isError ? (
          <div className='py-12 text-center text-muted-foreground'>
            <p>Error al cargar el historial.</p>
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mesa</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Factura</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className='py-12 text-center text-muted-foreground'
                      >
                        No hay juegos con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => {
                      const juego = row.original
                      return (
                        <TableRow key={juego.id}>
                          <TableCell className='font-medium'>
                            Mesa {juego.mesa_numero}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                'font-medium',
                                estadoClasses[juego.status] ?? 'bg-gray-100 text-gray-700'
                              )}
                            >
                              {estadoLabels[juego.status] ?? juego.status}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-muted-foreground'>
                            {formatFecha(juego.hora_inicio)}
                          </TableCell>
                          <TableCell className='text-muted-foreground'>
                            {formatDuracion(juego.tiempo_minutos)}
                          </TableCell>
                          <TableCell className='font-semibold'>
                            {formatCurrency(juego.total_juego)}
                          </TableCell>
                          <TableCell className='text-muted-foreground text-sm'>
                            {juego.numero_factura ?? '—'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                navigate({
                                  to: '/juegos/$juegoId',
                                  params: { juegoId: String(juego.id) },
                                })
                              }
                            >
                              <Eye className='mr-1.5 h-3.5 w-3.5' />
                              Ver resumen
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            <DataTablePagination table={table} />
          </div>
        )}
      </Main>
    </>
  )
}
