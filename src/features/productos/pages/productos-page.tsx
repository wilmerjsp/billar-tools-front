import { useState, useMemo } from 'react'
import { PackageOpen, Pencil, Plus, DatabaseZap, Layers } from 'lucide-react'
import { toast } from 'sonner'
import {
  type ColumnDef,
  type RowSelectionState,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DataTablePagination } from '@/components/data-table'

import { type Producto } from '@/types/models'
import { useCategorias, useCargarInventarioDefault, useProductoMutations, useProductos } from '../hooks/use-productos'
import { ProductoFormModal } from '../components/producto-form-modal'
import { AlertasStockBanner } from '@/features/inventario/components/alerta-stock-banner'
import { API_ERROR_TOAST_ID, showApiError } from '@/lib/handle-server-error'

// Columnas mínimas requeridas por useReactTable
const columns: ColumnDef<Producto>[] = [
  { accessorKey: 'nombre' },
  { accessorKey: 'categoria' },
  { accessorKey: 'precio' },
  { accessorKey: 'disponible' },
]

export function ProductosPage() {
  const [search, setSearch] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('all')
  const [soloDisponibles, setSoloDisponibles] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | undefined>(undefined)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [inventarioDialogOpen, setInventarioDialogOpen] = useState(false)

  const { data: productos, isLoading, isError } = useProductos()
  const { data: categorias } = useCategorias()
  const { toggleDisponibilidad, deleteMuchos } = useProductoMutations()
  const cargarInventario = useCargarInventarioDefault()

  const productosFiltrados = useMemo(() => {
    if (!productos) return []
    return productos.filter((p) => {
      const coincideNombre = p.nombre.toLowerCase().includes(search.toLowerCase())
      const coincideCategoria =
        categoriaFiltro === 'all' || String(p.categoria_id) === categoriaFiltro
      const coincideDisponible = !soloDisponibles || p.disponible
      return coincideNombre && coincideCategoria && coincideDisponible
    })
  }, [productos, search, categoriaFiltro, soloDisponibles])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: productosFiltrados,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original)
  const selectedCount = selectedRows.length

  function handleEditar(producto: Producto) {
    setProductoSeleccionado(producto)
    setModalOpen(true)
  }

  function handleNuevo() {
    setProductoSeleccionado(undefined)
    setModalOpen(true)
  }

  function handleEditarSeleccionado() {
    if (selectedRows.length === 1) {
      handleEditar(selectedRows[0])
    }
  }

  function handleToggleDisponibilidad(producto: Producto) {
    toggleDisponibilidad.mutate(
      { id: producto.id, disponible: !producto.disponible },
      { onError: (error) => showApiError(error, 'Error al cambiar la disponibilidad') }
    )
  }

  function handleCargarInventario() {
    cargarInventario.mutate(undefined, {
      onSuccess: () => {
        toast.success('Inventario por defecto cargado correctamente')
        setInventarioDialogOpen(false)
      },
      onError: (error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status === 409) {
          toast.error(
            'Este billar ya tiene categorías. No se puede cargar el inventario por defecto.',
            { id: API_ERROR_TOAST_ID }
          )
        } else {
          showApiError(error, 'Error al cargar el inventario por defecto')
        }
        setInventarioDialogOpen(false)
      },
    })
  }

  function handleDeleteConfirm() {
    const ids = selectedRows.map((p) => p.id)
    deleteMuchos.mutate(ids, {
      onSuccess: () => {
        toast.success(`${ids.length} producto(s) eliminado(s) correctamente`)
        setRowSelection({})
        setDeleteDialogOpen(false)
      },
      onError: (error) => showApiError(error, 'Error al eliminar los productos'),
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
            <h2 className='text-2xl font-bold tracking-tight'>Productos</h2>
            <p className='text-muted-foreground'>
              Gestiona el catálogo de productos del billar.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => setInventarioDialogOpen(true)}
            >
              <DatabaseZap className='mr-2 h-4 w-4' />
              Cargar inventario por defecto
            </Button>
            <Button
              variant='outline'
              disabled={selectedCount !== 1}
              onClick={handleEditarSeleccionado}
            >
              <Pencil className='mr-2 h-4 w-4' />
              Editar
            </Button>
            {/* Botón de eliminar deshabilitado temporalmente.
                Para restaurarlo, descomentar y re-agregar Trash2 al import de lucide-react.
            <Button
              variant='destructive'
              disabled={selectedCount === 0}
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Eliminar{selectedCount > 0 ? ` (${selectedCount})` : ''}
            </Button>
            */}
            <Button onClick={handleNuevo}>
              <Plus className='mr-2 h-4 w-4' />
              Nuevo Producto
            </Button>
          </div>
        </div>

        <AlertasStockBanner />

        <div className='mb-4 flex flex-wrap gap-3'>
          <Input
            placeholder='Buscar por nombre...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full sm:w-64'
          />
          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger className='w-full sm:w-48'>
              <SelectValue placeholder='Todas las categorías' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todas las categorías</SelectItem>
              {categorias?.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className='flex items-center gap-2'>
            <Switch
              id='solo-disponibles'
              checked={soloDisponibles}
              onCheckedChange={setSoloDisponibles}
            />
            <Label htmlFor='solo-disponibles' className='cursor-pointer'>
              Solo disponibles
            </Label>
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
            <PackageOpen className='mb-4 h-12 w-12' />
            <p>Error al cargar los productos. Intenta de nuevo.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className='flex flex-col gap-4'>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[50px]'>
                      <Checkbox
                        checked={
                          table.getIsAllPageRowsSelected() ||
                          (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(value) =>
                          table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label='Seleccionar todo'
                      />
                    </TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Disponible</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className='py-12 text-center'>
                        <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                          <PackageOpen className='h-10 w-10' />
                          <p>No se encontraron productos.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => {
                      const producto = row.original
                      return (
                        <TableRow
                          key={producto.id}
                          data-state={row.getIsSelected() ? 'selected' : undefined}
                        >
                          <TableCell>
                            <Checkbox
                              checked={row.getIsSelected()}
                              onCheckedChange={(value) => row.toggleSelected(!!value)}
                              aria-label='Seleccionar fila'
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell className='font-medium'>
                            <span className='flex items-center gap-2'>
                              {producto.nombre}
                              {producto.es_combo && (
                                <Badge variant='secondary' className='gap-1'>
                                  <Layers className='h-3 w-3' />
                                  Combo
                                  {producto.stock_disponible != null &&
                                    ` · ${parseFloat(producto.stock_disponible)} disp.`}
                                </Badge>
                              )}
                            </span>
                          </TableCell>
                          <TableCell className='text-muted-foreground'>
                            {producto.categoria.nombre}
                          </TableCell>
                          <TableCell>
                            {Number(producto.precio).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={producto.disponible}
                              onCheckedChange={() =>
                                handleToggleDisponibilidad(producto)
                              }
                            />
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

      <ProductoFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        producto={productoSeleccionado}
      />

      <AlertDialog open={inventarioDialogOpen} onOpenChange={setInventarioDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cargar inventario por defecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se cargarán las categorías y productos predeterminados para este billar.
              Solo es posible si aún no tiene categorías registradas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCargarInventario}
              disabled={cargarInventario.isPending}
            >
              {cargarInventario.isPending ? 'Cargando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar productos?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán {selectedCount} producto(s). Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
