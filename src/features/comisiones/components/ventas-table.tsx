import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ClipboardList, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
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

import { useCajas, useHistorialTurnos } from '@/features/caja/hooks/use-caja'
import type { TurnoCaja } from '@/types/models'

const columns: ColumnDef<TurnoCaja>[] = [
  { accessorKey: 'id' },
  { accessorKey: 'caja_nombre' },
  { accessorKey: 'cajero_nombre' },
  { accessorKey: 'fecha_apertura' },
  { accessorKey: 'fecha_cierre' },
  { accessorKey: 'total_acumulado' },
]

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

// eslint-disable-next-line react-hooks/incompatible-library
export function VentasTable() {
  const [selectedCajaId, setSelectedCajaId] = useState<number>(0)
  const [busqueda, setBusqueda] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  const { data: cajas, isLoading: cajasLoading } = useCajas()
  const cajaId = selectedCajaId || (cajas?.[0]?.id ?? 0)

  const { data: turnos, isLoading, isError } = useHistorialTurnos(cajaId)

  const cajaNombre = cajas?.find((c) => c.id === cajaId)?.nombre ?? ''

  const turnosFiltrados = useMemo(() => {
    return (
      (turnos ?? [])
        // Incluye también turnos abiertos (ventas en vivo)
        .filter((t) => {
          if (!busqueda) return true
          const q = busqueda.toLowerCase()
          return (
            String(t.id).includes(q) ||
            (t.cajero_nombre ?? '').toLowerCase().includes(q) ||
            cajaNombre.toLowerCase().includes(q)
          )
        })
        .filter((t) => {
          if (!fechaDesde) return true
          return new Date(t.fecha_apertura) >= new Date(fechaDesde)
        })
        .filter((t) => {
          if (!fechaHasta) return true
          const hasta = new Date(fechaHasta)
          hasta.setHours(23, 59, 59, 999)
          // Turnos abiertos: se filtra por la fecha de apertura
          return new Date(t.fecha_cierre ?? t.fecha_apertura) <= hasta
        })
        // Abiertos primero, luego por apertura más reciente
        .sort((a, b) => {
          const abiertoA = a.fecha_cierre ? 1 : 0
          const abiertoB = b.fecha_cierre ? 1 : 0
          if (abiertoA !== abiertoB) return abiertoA - abiertoB
          return (
            new Date(b.fecha_apertura).getTime() -
            new Date(a.fecha_apertura).getTime()
          )
        })
    )
  }, [turnos, busqueda, fechaDesde, fechaHasta, cajaNombre])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: turnosFiltrados,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <div className='space-y-4'>
      {/* Filtros */}
      <div className='flex flex-wrap gap-3'>
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

        <div className='relative w-full sm:w-64'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar por turno, cajero...'
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className='pl-8'
          />
        </div>

        <div className='flex items-center gap-2'>
          <Label className='text-sm text-muted-foreground'>Desde</Label>
          <Input
            type='date'
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className='w-36'
          />
        </div>

        <div className='flex items-center gap-2'>
          <Label className='text-sm text-muted-foreground'>Hasta</Label>
          <Input
            type='date'
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className='w-36'
          />
        </div>

        {(busqueda || fechaDesde || fechaHasta) && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              setBusqueda('')
              setFechaDesde('')
              setFechaHasta('')
            }}
          >
            Limpiar filtros
          </Button>
        )}
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
                  <TableHead className='w-20'>Turno</TableHead>
                  <TableHead>Caja</TableHead>
                  <TableHead>Cajero</TableHead>
                  <TableHead>Apertura</TableHead>
                  <TableHead>Cierre</TableHead>
                  <TableHead className='text-right'>Total ventas</TableHead>
                  <TableHead className='text-center'>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='py-12 text-center'>
                      <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                        <ClipboardList className='h-10 w-10' />
                        <p>No hay turnos para los filtros seleccionados.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => {
                    const turno = row.original
                    const nombre = turno.caja_nombre ?? cajaNombre
                    return (
                      <TableRow key={turno.id}>
                        <TableCell className='font-medium text-muted-foreground'>
                          #{turno.id}
                        </TableCell>
                        <TableCell>
                          <Link
                            to='/comisiones/ventas-mesera/$turnoId'
                            params={{ turnoId: String(turno.id) }}
                            className='font-medium text-primary underline-offset-4 hover:underline'
                          >
                            {nombre || `Turno #${turno.id}`}
                          </Link>
                        </TableCell>
                        <TableCell>{turno.cajero_nombre ?? '—'}</TableCell>
                        <TableCell className='text-sm'>
                          {formatFecha(turno.fecha_apertura)}
                        </TableCell>
                        <TableCell className='text-sm text-muted-foreground'>
                          {formatFecha(turno.fecha_cierre)}
                        </TableCell>
                        <TableCell className='text-right font-medium'>
                          {turno.total_acumulado !== undefined
                            ? formatCurrency(turno.total_acumulado)
                            : '—'}
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge variant={turno.fecha_cierre ? 'secondary' : 'default'}>
                            {turno.fecha_cierre ? 'Cerrado' : 'Abierto'}
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
    </div>
  )
}
