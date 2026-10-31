import { useState } from 'react'
import { Check, Minus, Plus, RotateCcw, ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useProductos, useCategorias } from '@/features/productos/hooks/use-productos'
import type { Producto } from '@/types/models'
import type { AgregarItemBody } from '../types'

export interface UltimoProducto {
  producto_id: number
  nombre: string
  cantidad: number
}

interface CartItem {
  producto_id: number
  nombre: string
  precio: number
  cantidad: number
}

interface Props {
  open: boolean
  isPending: boolean
  ultimoProducto?: UltimoProducto
  onConfirm: (items: AgregarItemBody[]) => void
  onClose: () => void
}

function ProductoCard({
  producto,
  enCarrito,
  onClick,
}: {
  producto: Producto
  enCarrito: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-start rounded-lg border p-3 text-left transition-all hover:bg-accent active:scale-95',
        enCarrito && 'border-primary bg-primary/5',
      )}
    >
      {enCarrito && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" />
        </span>
      )}
      <p className="pr-6 text-sm font-medium leading-tight">{producto.nombre}</p>
      <p className="mt-1 text-xs font-semibold text-primary">
        ${Number(producto.precio).toLocaleString('es-CO')}
      </p>
    </button>
  )
}

function CantidadControl({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:bg-accent disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-7 text-center text-sm font-bold tabular-nums">{value}</span>
      <button
        type="button"
        disabled={value >= 99}
        onClick={() => onChange(Math.min(99, value + 1))}
        className="flex h-7 w-7 items-center justify-center rounded-md border transition-colors hover:bg-accent disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function AgregarItemDialog({
  open,
  isPending,
  ultimoProducto,
  onConfirm,
  onClose,
}: Props) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null)
  const [carrito, setCarrito] = useState<CartItem[]>([])

  const { data: productos = [], isLoading: loadingProductos } = useProductos()
  const { data: categorias = [], isLoading: loadingCategorias } = useCategorias()

  const isLoading = loadingProductos || loadingCategorias

  function toggleProducto(producto: Producto) {
    setCarrito((prev) => {
      const existe = prev.find((c) => c.producto_id === producto.id)
      if (existe) {
        return prev.filter((c) => c.producto_id !== producto.id)
      }
      return [
        ...prev,
        {
          producto_id: producto.id,
          nombre: producto.nombre,
          precio: Number(producto.precio),
          cantidad: 1,
        },
      ]
    })
  }

  function actualizarCantidad(producto_id: number, cantidad: number) {
    setCarrito((prev) =>
      prev.map((c) => (c.producto_id === producto_id ? { ...c, cantidad } : c)),
    )
  }

  function quitarDelCarrito(producto_id: number) {
    setCarrito((prev) => prev.filter((c) => c.producto_id !== producto_id))
  }

  function handleRepetirUltimo() {
    if (!ultimoProducto) return
    setCarrito((prev) => {
      const existe = prev.find((c) => c.producto_id === ultimoProducto.producto_id)
      if (existe) {
        return prev.map((c) =>
          c.producto_id === ultimoProducto.producto_id
            ? { ...c, cantidad: c.cantidad + ultimoProducto.cantidad }
            : c,
        )
      }
      const productoCompleto = productos.find((p) => p.id === ultimoProducto.producto_id)
      return [
        ...prev,
        {
          producto_id: ultimoProducto.producto_id,
          nombre: ultimoProducto.nombre,
          precio: productoCompleto ? Number(productoCompleto.precio) : 0,
          cantidad: ultimoProducto.cantidad,
        },
      ]
    })
  }

  function handleConfirm() {
    if (carrito.length === 0) return
    onConfirm(carrito.map((c) => ({ producto_id: c.producto_id, cantidad: c.cantidad })))
  }

  function handleClose() {
    setCarrito([])
    setCategoriaSeleccionada(null)
    onClose()
  }

  const productosDisponibles = productos.filter((p) => p.disponible)
  const productosFiltrados = categoriaSeleccionada
    ? productosDisponibles.filter((p) => p.categoria_id === categoriaSeleccionada)
    : productosDisponibles

  const totalCarrito = carrito.reduce((sum, c) => sum + c.precio * c.cantidad, 0)
  const totalItems = carrito.reduce((sum, c) => sum + c.cantidad, 0)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="px-6 pb-3 pt-6">
          <DialogTitle>Agregar productos</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Repetir último — botón prominente */}
          {ultimoProducto && (
            <div className="px-6">
              <button
                type="button"
                onClick={handleRepetirUltimo}
                className="flex w-full items-center gap-3 rounded-xl border-2 border-primary/30 bg-primary/10 px-4 py-3 text-left transition-colors hover:border-primary/60 hover:bg-primary/15 active:scale-[0.99]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <RotateCcw className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Repetir último pedido
                  </p>
                  <p className="truncate text-sm font-medium text-foreground">
                    {ultimoProducto.nombre}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-sm font-bold text-primary-foreground">
                  ×{ultimoProducto.cantidad}
                </span>
              </button>
            </div>
          )}

          {/* Filtros de categoría */}
          <div className="px-6">
            {isLoading ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <Skeleton key={n} className="h-7 w-20 rounded-full" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategoriaSeleccionada(null)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-accent',
                    categoriaSeleccionada === null &&
                      'border-primary bg-primary text-primary-foreground hover:bg-primary/90',
                  )}
                >
                  Todos
                </button>
                {categorias
                  .filter((c) => c.activa)
                  .sort((a, b) => a.orden - b.orden)
                  .map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setCategoriaSeleccionada(
                          categoriaSeleccionada === cat.id ? null : cat.id,
                        )
                      }
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-accent',
                        categoriaSeleccionada === cat.id &&
                          'border-primary bg-primary text-primary-foreground hover:bg-primary/90',
                      )}
                    >
                      {cat.icono && <span className="mr-1">{cat.icono}</span>}
                      {cat.nombre}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Grid de productos */}
          <div className="overflow-hidden px-6">
            {isLoading ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <Skeleton key={n} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : productosFiltrados.length === 0 ? (
              <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
                Sin productos en esta categoría
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {productosFiltrados.map((p) => (
                    <ProductoCard
                      key={p.id}
                      producto={p}
                      enCarrito={carrito.some((c) => c.producto_id === p.id)}
                      onClick={() => toggleProducto(p)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Carrito */}
          {carrito.length > 0 && (
            <>
              <Separator />
              <div className="px-6">
                <div className="mb-2 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    En este pedido
                  </span>
                </div>
                <div className="max-h-40 space-y-1.5 overflow-y-auto">
                  {carrito.map((item) => (
                    <div
                      key={item.producto_id}
                      className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {item.nombre}
                      </span>
                      <CantidadControl
                        value={item.cantidad}
                        onChange={(v) => actualizarCantidad(item.producto_id, v)}
                      />
                      <span className="w-20 text-right text-sm font-semibold tabular-nums">
                        ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                      </span>
                      <button
                        type="button"
                        onClick={() => quitarDelCarrito(item.producto_id)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-4 items-center px-6 pb-6">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isPending || carrito.length === 0}
            onClick={handleConfirm}
            className="min-w-40"
          >
            {isPending ? (
              'Agregando…'
            ) : carrito.length === 0 ? (
              'Selecciona productos'
            ) : (
              <>
                Agregar {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'}
                <span className="ml-2 opacity-75">
                  — ${totalCarrito.toLocaleString('es-CO')}
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
