import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  BookOpenText,
  Boxes,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  FileText,
  Search as SearchIcon,
  Sheet,
  ShoppingBasket,
  Wrench,
} from 'lucide-react'
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DataTablePagination } from '@/components/data-table'

import { type InventarioItem, type MovimientoInventario } from '@/types/models'
import { TipoAjusteInventario } from '@/types/enums'
import { cn } from '@/lib/utils'
import {
  exportInventarioCSV,
  exportInventarioExcel,
  exportInventarioPDF,
} from '@/lib/export-utils'
import { useInventario, useMovimientos } from '../hooks/use-inventario'
import { AlertasStockBanner } from '../components/alerta-stock-banner'
import { AjusteStockModal } from '../components/ajuste-stock-modal'
import { CompraModal } from '../components/compra-modal'
import { ConteoFisicoModal } from '../components/conteo-fisico-modal'
import { ValorizadoTab } from '../components/valorizado-tab'

type StockFilter = 'todos' | 'bajo' | 'critico'
type MovFilter = TipoAjusteInventario | 'todos'

const stockColumns: ColumnDef<InventarioItem>[] = [
  { accessorKey: 'producto' },
  { accessorKey: 'stock_actual' },
  { accessorKey: 'stock_minimo' },
]

const movimientosColumns: ColumnDef<MovimientoInventario>[] = [
  { accessorKey: 'inventario' },
  { accessorKey: 'tipo' },
  { accessorKey: 'cantidad' },
  { accessorKey: 'motivo' },
  { accessorKey: 'fecha_hora' },
]

function stockColorClass(item: InventarioItem): string {
  const actual = Number(item.stock_actual)
  const minimo = Number(item.stock_minimo)
  if (actual < minimo) return 'text-red-600 font-semibold'
  if (actual < minimo * 1.5) return 'text-yellow-600 font-semibold'
  return 'text-green-600 font-semibold'
}

interface AjusteModal {
  open: boolean
  productoId: number
  productoNombre: string
}

export function InventarioPage() {
  const navigate = useNavigate()
  const [ajusteModal, setAjusteModal] = useState<AjusteModal>({
    open: false,
    productoId: 0,
    productoNombre: '',
  })
  const [compraOpen, setCompraOpen] = useState(false)
  const [conteoOpen, setConteoOpen] = useState(false)

  // Stock filters
  const [stockSearch, setStockSearch] = useState('')
  const [stockFilter, setStockFilter] = useState<StockFilter>('todos')

  // Movimientos filters
  const [movSearch, setMovSearch] = useState('')
  const [movFilter, setMovFilter] = useState<MovFilter>('todos')

  const { data: inventario, isLoading, isError } = useInventario()
  const { data: movimientos, isLoading: loadingMovimientos } = useMovimientos()

  const filteredStock = useMemo(() => {
    let items = inventario ?? []
    if (stockSearch.trim()) {
      const q = stockSearch.toLowerCase()
      items = items.filter((i) => i.producto.nombre.toLowerCase().includes(q))
    }
    if (stockFilter === 'critico') {
      items = items.filter((i) => Number(i.stock_actual) < Number(i.stock_minimo))
    } else if (stockFilter === 'bajo') {
      items = items.filter(
        (i) => Number(i.stock_actual) >= Number(i.stock_minimo) && Number(i.stock_actual) < Number(i.stock_minimo) * 1.5
      )
    }
    return items
  }, [inventario, stockSearch, stockFilter])

  const filteredMovimientos = useMemo(() => {
    let items = movimientos ?? []
    if (movSearch.trim()) {
      const q = movSearch.toLowerCase()
      items = items.filter(
        (m) =>
          m.inventario.producto.nombre.toLowerCase().includes(q) ||
          m.motivo.toLowerCase().includes(q)
      )
    }
    if (movFilter !== 'todos') {
      items = items.filter((m) => m.tipo === movFilter)
    }
    return items
  }, [movimientos, movSearch, movFilter])

  // eslint-disable-next-line react-hooks/incompatible-library
  const stockTable = useReactTable({
    data: filteredStock,
    columns: stockColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const movimientosTable = useReactTable({
    data: filteredMovimientos,
    columns: movimientosColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  function handleAbrirAjuste(item: InventarioItem) {
    setAjusteModal({
      open: true,
      productoId: item.producto_id,
      productoNombre: item.producto.nombre,
    })
  }

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
        <div className='mb-6 flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Inventario</h2>
            <p className='text-muted-foreground'>
              Control de stock de productos del billar.
            </p>
          </div>
          <div className='flex gap-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' disabled={filteredStock.length === 0}>
                  <Download className='mr-2 h-4 w-4' />
                  Descargar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => exportInventarioCSV(filteredStock)}>
                  <FileText className='mr-2 h-4 w-4' />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void exportInventarioExcel(filteredStock)}
                >
                  <FileSpreadsheet className='mr-2 h-4 w-4' />
                  Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportInventarioPDF(filteredStock)}>
                  <Sheet className='mr-2 h-4 w-4' />
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant='outline' onClick={() => setConteoOpen(true)}>
              <ClipboardCheck className='mr-2 h-4 w-4' />
              Conteo físico
            </Button>
            <Button onClick={() => setCompraOpen(true)}>
              <ShoppingBasket className='mr-2 h-4 w-4' />
              Registrar compra
            </Button>
          </div>
        </div>

        <AlertasStockBanner />

        <Tabs defaultValue='stock'>
          <TabsList>
            <TabsTrigger value='stock'>Stock actual</TabsTrigger>
            <TabsTrigger value='movimientos'>Movimientos</TabsTrigger>
            <TabsTrigger value='valorizado'>Valorizado</TabsTrigger>
          </TabsList>

          <TabsContent value='stock' className='mt-4'>
            {/* Búsqueda y filtros — Stock */}
            <div className='mb-4 flex flex-wrap items-center gap-3'>
              <div className='relative flex-1 min-w-48'>
                <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Buscar producto...'
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  className='pl-9'
                />
              </div>
              <div className='flex gap-2'>
                {(['todos', 'bajo', 'critico'] as StockFilter[]).map((f) => (
                  <Button
                    key={f}
                    size='sm'
                    variant={stockFilter === f ? 'default' : 'outline'}
                    onClick={() => setStockFilter(f)}
                  >
                    {f === 'todos' ? 'Todos' : f === 'bajo' ? 'Stock bajo' : 'Crítico'}
                  </Button>
                ))}
              </div>
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
                <Boxes className='mb-4 h-12 w-12' />
                <p>Error al cargar el inventario. Intenta de nuevo.</p>
              </div>
            )}

            {!isLoading && !isError && (
              <div className='flex flex-col gap-4'>
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Stock actual</TableHead>
                        <TableHead>Stock mínimo</TableHead>
                        <TableHead className='w-[220px]'>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockTable.getRowModel().rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className='py-12 text-center'>
                            <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                              <Boxes className='h-10 w-10' />
                              <p>No hay productos con inventario registrado.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        stockTable.getRowModel().rows.map((row) => {
                          const item = row.original
                          return (
                            <TableRow key={item.producto_id}>
                              <TableCell className='font-medium'>
                                {item.producto.nombre}
                              </TableCell>
                              <TableCell>
                                <span className={cn(stockColorClass(item))}>
                                  {Math.trunc(item.stock_actual)}
                                </span>
                              </TableCell>
                              <TableCell className='text-muted-foreground'>
                                {Math.trunc(item.stock_minimo)}
                              </TableCell>
                              <TableCell>
                                <div className='flex gap-2'>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => handleAbrirAjuste(item)}
                                  >
                                    <Wrench className='mr-1 h-3 w-3' />
                                    Ajustar
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='ghost'
                                    onClick={() =>
                                      navigate({
                                        to: '/inventario/kardex/$productoId',
                                        params: {
                                          productoId: String(item.producto_id),
                                        },
                                      })
                                    }
                                  >
                                    <BookOpenText className='mr-1 h-3 w-3' />
                                    Kardex
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
                <DataTablePagination table={stockTable} />
              </div>
            )}
          </TabsContent>

          <TabsContent value='movimientos' className='mt-4'>
            {/* Búsqueda y filtros — Movimientos */}
            <div className='mb-4 flex flex-wrap items-center gap-3'>
              <div className='relative flex-1 min-w-48'>
                <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Buscar por producto o motivo...'
                  value={movSearch}
                  onChange={(e) => setMovSearch(e.target.value)}
                  className='pl-9'
                />
              </div>
              <div className='flex gap-2'>
                {(
                  [
                    'todos',
                    TipoAjusteInventario.ENTRADA,
                    TipoAjusteInventario.SALIDA,
                    TipoAjusteInventario.AJUSTE,
                  ] as MovFilter[]
                ).map((f) => (
                  <Button
                    key={f}
                    size='sm'
                    variant={movFilter === f ? 'default' : 'outline'}
                    onClick={() => setMovFilter(f)}
                  >
                    {f === 'todos'
                      ? 'Todos'
                      : f === TipoAjusteInventario.ENTRADA
                        ? 'Entrada'
                        : f === TipoAjusteInventario.SALIDA
                          ? 'Salida'
                          : 'Ajuste'}
                  </Button>
                ))}
              </div>
            </div>

            {loadingMovimientos && (
              <div className='space-y-2'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className='h-12 w-full' />
                ))}
              </div>
            )}

            {!loadingMovimientos && (
              <div className='flex flex-col gap-4'>
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movimientosTable.getRowModel().rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className='py-12 text-center'>
                            <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                              <Boxes className='h-10 w-10' />
                              <p>No hay movimientos registrados.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        movimientosTable.getRowModel().rows.map((row) => {
                          const mov = row.original
                          return (
                            <TableRow key={mov.id}>
                              <TableCell className='font-medium'>
                                {mov.inventario.producto.nombre}
                              </TableCell>
                              <TableCell className='capitalize'>
                                {mov.tipo}
                              </TableCell>
                              <TableCell>{parseFloat(mov.cantidad)}</TableCell>
                              <TableCell className='text-muted-foreground'>
                                {mov.motivo}
                              </TableCell>
                              <TableCell className='text-muted-foreground text-sm'>
                                {new Date(mov.fecha_hora).toLocaleString('es-CO', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
                <DataTablePagination table={movimientosTable} />
              </div>
            )}
          </TabsContent>

          <TabsContent value='valorizado' className='mt-4'>
            <ValorizadoTab />
          </TabsContent>
        </Tabs>
      </Main>

      <AjusteStockModal
        open={ajusteModal.open}
        onOpenChange={(v) => setAjusteModal((s) => ({ ...s, open: v }))}
        productoId={ajusteModal.productoId}
        productoNombre={ajusteModal.productoNombre}
      />

      <CompraModal open={compraOpen} onOpenChange={setCompraOpen} />

      <ConteoFisicoModal open={conteoOpen} onOpenChange={setConteoOpen} />
    </>
  )
}
