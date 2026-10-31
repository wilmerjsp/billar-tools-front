import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ClipboardList } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table'
import { type TurnoCaja } from '@/types/models'
import { useCajas, useHistorialTurnos } from '../hooks/use-caja'

const columns: ColumnDef<TurnoCaja>[] = [
  { accessorKey: 'id' },
  { accessorKey: 'cajero_nombre' },
  { accessorKey: 'fecha_apertura' },
  { accessorKey: 'fecha_cierre' },
  { accessorKey: 'monto_apertura' },
  { accessorKey: 'total_acumulado' },
  { accessorKey: 'status' },
]

function formatCurrency(value: number | string | undefined): string {
  if (!value && value !== 0) return '—'
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

export function TurnosCajaPage() {
  const [selectedCajaId, setSelectedCajaId] = useState<number>(0)
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos')

  const { data: cajas, isLoading: cajasLoading } = useCajas()
  const cajaId = selectedCajaId || (cajas?.[0]?.id ?? 0)

  const { data: turnos, isLoading, isError } = useHistorialTurnos(cajaId)

  const turnosFiltrados = useMemo(
    () =>
      (turnos ?? []).filter((t) => {
        if (estadoFiltro === 'todos') return true
        const activo = !t.fecha_cierre
        return estadoFiltro === 'activo' ? activo : !activo
      }),
    [turnos, estadoFiltro]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: turnosFiltrados,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

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
          <h2 className='text-2xl font-bold tracking-tight'>
            Historial de Turnos
          </h2>
          <p className='text-muted-foreground'>
            Consulta los turnos de caja registrados.
          </p>
        </div>

        <div className='mb-4 flex flex-wrap gap-3'>
          {!cajasLoading && (cajas?.length ?? 0) > 1 && (
            <Select
              value={String(cajaId)}
              onValueChange={(v) => setSelectedCajaId(Number(v))}
            >
              <SelectTrigger className='w-52'>
                <SelectValue placeholder='Seleccionar caja' />
              </SelectTrigger>
              <SelectContent>
                {cajas?.map((caja) => (
                  <SelectItem key={caja.id} value={String(caja.id)}>
                    {caja.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='Estado' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='todos'>Todos</SelectItem>
              <SelectItem value='activo'>Activo</SelectItem>
              <SelectItem value='cerrado'>Cerrado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <div className='space-y-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-12 w-full' />
            ))}
          </div>
        )}

        {isError && (
          <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
            <ClipboardList className='mb-4 h-12 w-12' />
            <p>Error al cargar los turnos. Intenta de nuevo.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className='flex flex-col gap-4'>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Turno</TableHead>
                    <TableHead>Cajero</TableHead>
                    <TableHead>Apertura</TableHead>
                    <TableHead>Cierre</TableHead>
                    <TableHead>Monto apertura</TableHead>
                    <TableHead>Total ventas</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className='py-12 text-center'
                      >
                        <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                          <ClipboardList className='h-10 w-10' />
                          <p>No se encontraron turnos.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => {
                      const turno = row.original
                      const activo = !turno.fecha_cierre
                      return (
                        <TableRow key={turno.id}>
                          <TableCell className='font-medium'>
                            <Link
                              to='/turnos/$turnoId'
                              params={{ turnoId: String(turno.id) }}
                              className='text-primary underline-offset-4 hover:underline'
                            >
                              #{turno.id}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {turno.cajero_nombre ?? '—'}
                          </TableCell>
                          <TableCell className='text-sm'>
                            {formatFecha(turno.fecha_apertura)}
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground'>
                            {formatFecha(turno.fecha_cierre)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(turno.monto_apertura)}
                          </TableCell>
                          <TableCell className='font-medium'>
                            {turno.total_acumulado !== undefined
                              ? formatCurrency(turno.total_acumulado)
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={activo ? 'default' : 'secondary'}>
                              {activo ? 'Activo' : 'Cerrado'}
                            </Badge>
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
