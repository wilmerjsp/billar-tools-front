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
import { cn } from '@/lib/utils'
import type { BarraHistorialItem, EstadoCuentaBarra } from '../types'
import { useHistorialBarra } from '../hooks/use-barra-admin'

const estadoLabels: Record<EstadoCuentaBarra, string> = {
  abierto: 'Abierto',
  cerrado: 'Cerrado',
  facturado: 'Facturado',
}

const estadoClasses: Record<EstadoCuentaBarra, string> = {
  abierto: 'bg-blue-100 text-blue-800',
  cerrado: 'bg-gray-100 text-gray-700',
  facturado: 'bg-green-100 text-green-800',
}

function formatCurrency(value: number): string {
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

function toISOStart(date: string) {
  return date ? `${date}T00:00:00` : undefined
}
function toISOEnd(date: string) {
  return date ? `${date}T23:59:59` : undefined
}

const columns: ColumnDef<BarraHistorialItem>[] = [
  { id: 'descripcion' },
  { id: 'atendido_por' },
  { id: 'status' },
  { id: 'fecha_hora' },
  { id: 'total' },
  { id: 'actions' },
]

export function BarraHistorialPage() {
  const navigate = useNavigate()

  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos')

  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const [filtrosActivos, setFiltrosActivos] = useState<{
    fecha_desde?: string
    fecha_hasta?: string
    status?: EstadoCuentaBarra
  }>({})

  const { data, isLoading, isError } = useHistorialBarra({
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
      status: estadoFiltro !== 'todos' ? (estadoFiltro as EstadoCuentaBarra) : undefined,
    })
  }

  function limpiarFiltros() {
    setFechaDesde('')
    setFechaHasta('')
    setEstadoFiltro('todos')
    setPageIndex(0)
    setFiltrosActivos({})
  }

  const hayFiltros = fechaDesde || fechaHasta || estadoFiltro !== 'todos'

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
          <h2 className='text-2xl font-bold tracking-tight'>Historial de Barra</h2>
          <p className='text-sm text-muted-foreground mt-1'>
            Todas las cuentas de barra registradas en el sistema
          </p>
        </div>

        {/* Filtros */}
        <div className='mb-6 rounded-lg border bg-card p-4'>
          <div className='grid gap-4 sm:grid-cols-3'>
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
              <Label>Estado</Label>
              <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='todos'>Todos</SelectItem>
                  <SelectItem value='abierto'>Abierto</SelectItem>
                  <SelectItem value='cerrado'>Cerrado</SelectItem>
                  <SelectItem value='facturado'>Facturado</SelectItem>
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
                    <TableHead>Descripción</TableHead>
                    <TableHead>Atendido por</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className='py-12 text-center text-muted-foreground'
                      >
                        No hay cuentas con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => {
                      const cuenta = row.original
                      const atendidoPor = cuenta.mesera_nombre ?? cuenta.admin_nombre ?? '—'
                      return (
                        <TableRow key={cuenta.id}>
                          <TableCell className='font-medium'>
                            {cuenta.descripcion || <span className='text-muted-foreground italic'>Sin descripción</span>}
                          </TableCell>
                          <TableCell className='text-muted-foreground'>
                            {atendidoPor}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                'font-medium',
                                estadoClasses[cuenta.status] ?? 'bg-gray-100 text-gray-700'
                              )}
                            >
                              {estadoLabels[cuenta.status] ?? cuenta.status}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-muted-foreground'>
                            {formatFecha(cuenta.fecha_hora)}
                          </TableCell>
                          <TableCell className='font-semibold'>
                            {formatCurrency(cuenta.total)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                navigate({
                                  to: '/barra-admin/historial/$cuentaId',
                                  params: { cuentaId: String(cuenta.id) },
                                })
                              }
                            >
                              <Eye className='mr-1.5 h-3.5 w-3.5' />
                              Ver detalle
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
