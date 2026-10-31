import { useMemo, useState } from 'react'
import { AlertCircle, Search } from 'lucide-react'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { CurrencyInput } from '@/components/shared/currency-input'

import { useCategorias, useProductos } from '@/features/productos/hooks/use-productos'
import { useComisionConfigMutations, useComisionConfigs } from '../hooks/use-comisiones'
import type { Producto } from '@/types/models'

const COP = (v: number) =>
  Number(v).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })

interface ConfigBatchModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function ConfigBatchModal({ open, onOpenChange }: ConfigBatchModalProps) {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('all')
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set())
  const [comisionFija, setComisionFija] = useState(0)
  const [isPending, setIsPending] = useState(false)

  const { data: productos, isLoading: loadingProductos } = useProductos()
  const { data: categorias } = useCategorias()
  const { data: configs } = useComisionConfigs()
  const { create } = useComisionConfigMutations()

  const productosDisponibles = useMemo(() => {
    const sinConfig = (productos ?? []).filter(
      (p) => !configs?.some((c) => c.producto_id === p.id && c.activa)
    )
    return sinConfig.filter((p) => {
      const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      const coincideCategoria =
        categoriaFiltro === 'all' || String(p.categoria_id) === categoriaFiltro
      return coincideNombre && coincideCategoria
    })
  }, [productos, configs, busqueda, categoriaFiltro])

  const productosSeleccionados: (Producto & { precioBarra: number; valido: boolean })[] =
    useMemo(() => {
      const todos = productos ?? []
      return Array.from(seleccionados)
        .map((id) => todos.find((p) => p.id === id))
        .filter((p): p is Producto => p != null)
        .map((p) => {
          const precioBarra = Number(p.precio) - comisionFija
          return { ...p, precioBarra, valido: precioBarra >= 0 }
        })
    }, [seleccionados, productos, comisionFija])

  const productosValidos = productosSeleccionados.filter((p) => p.valido)
  const productosInvalidos = productosSeleccionados.filter((p) => !p.valido)

  function toggleProducto(id: number) {
    setSeleccionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleTodos() {
    if (seleccionados.size === productosDisponibles.length) {
      setSeleccionados(new Set())
    } else {
      setSeleccionados(new Set(productosDisponibles.map((p) => p.id)))
    }
  }

  function handleClose() {
    setBusqueda('')
    setCategoriaFiltro('all')
    setSeleccionados(new Set())
    setComisionFija(0)
    onOpenChange(false)
  }

  async function handleCrear() {
    if (productosValidos.length === 0) return
    setIsPending(true)

    let creados = 0
    let errores = 0

    for (const p of productosValidos) {
      await new Promise<void>((resolve) => {
        create.mutate(
          { producto_id: p.id, precio_barra: p.precioBarra },
          {
            onSuccess: () => { creados++; resolve() },
            onError: (error) => {
              const code =
                error instanceof AxiosError ? error.response?.data?.error?.code : undefined
              if (code !== 'COMISION_DUPLICADA') errores++
              resolve()
            },
          }
        )
      })
    }

    setIsPending(false)

    if (creados > 0) toast.success(`${creados} configuración(es) creadas correctamente`)
    if (errores > 0) toast.error(`${errores} producto(s) no se pudieron configurar`)

    handleClose()
  }

  const todosSeleccionados =
    productosDisponibles.length > 0 &&
    seleccionados.size === productosDisponibles.length

  const algunosSeleccionados =
    seleccionados.size > 0 && seleccionados.size < productosDisponibles.length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[560px]'>
        <DialogHeader>
          <DialogTitle>Configurar comisiones por lote</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Filtros */}
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar producto...'
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className='pl-8'
              />
            </div>
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger className='w-36'>
                <SelectValue placeholder='Categoría' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todas</SelectItem>
                {categorias?.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lista de productos */}
          <div className='rounded-md border'>
            {loadingProductos ? (
              <div className='space-y-2 p-3'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className='h-8 w-full' />
                ))}
              </div>
            ) : productosDisponibles.length === 0 ? (
              <p className='py-6 text-center text-sm text-muted-foreground'>
                Sin productos disponibles
              </p>
            ) : (
              <div className='max-h-52 overflow-y-auto'>
                <div className='flex items-center gap-2 border-b bg-muted/40 px-3 py-2'>
                  <Checkbox
                    id='select-all'
                    checked={todosSeleccionados ? true : algunosSeleccionados ? 'indeterminate' : false}
                    onCheckedChange={toggleTodos}
                  />
                  <Label htmlFor='select-all' className='cursor-pointer text-xs font-medium'>
                    Seleccionar todos ({productosDisponibles.length})
                  </Label>
                </div>
                {productosDisponibles.map((p) => (
                  <div
                    key={p.id}
                    className='flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-muted/40'
                    onClick={() => toggleProducto(p.id)}
                  >
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        checked={seleccionados.has(p.id)}
                        onCheckedChange={() => toggleProducto(p.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className='text-sm'>{p.nombre}</span>
                    </div>
                    <span className='text-xs text-muted-foreground'>{COP(Number(p.precio))}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comisión fija */}
          <div className='space-y-1.5'>
            <Label>Comisión por unidad (igual para todos)</Label>
            <CurrencyInput value={comisionFija} onChange={setComisionFija} placeholder='$ 0' />
            <p className='text-xs text-muted-foreground'>
              El precio barra de cada producto se calculará como: precio venta − comisión.
            </p>
          </div>

          {/* Preview */}
          {productosSeleccionados.length > 0 && (
            <div className='rounded-md border text-sm'>
              <div className='grid grid-cols-3 border-b bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground'>
                <span>Producto</span>
                <span className='text-right'>Precio barra</span>
                <span className='text-right'>Comisión</span>
              </div>
              {productosSeleccionados.map((p) => (
                <div
                  key={p.id}
                  className={`grid grid-cols-3 px-3 py-1.5 ${!p.valido ? 'bg-destructive/5' : ''}`}
                >
                  <span className={!p.valido ? 'text-destructive' : ''}>{p.nombre}</span>
                  <span className={`text-right ${!p.valido ? 'text-destructive' : ''}`}>
                    {p.valido ? COP(p.precioBarra) : 'Inválido'}
                  </span>
                  <span className={`text-right font-medium ${p.valido ? 'text-green-600' : 'text-destructive'}`}>
                    {p.valido ? COP(comisionFija) : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {productosInvalidos.length > 0 && (
            <div className='flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive'>
              <AlertCircle className='mt-0.5 h-3.5 w-3.5 shrink-0' />
              <span>
                {productosInvalidos.length} producto(s) tienen comisión mayor a su precio de venta y serán omitidos.
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleCrear}
            disabled={isPending || productosValidos.length === 0 || comisionFija <= 0}
          >
            {isPending
              ? 'Creando...'
              : `Crear ${productosValidos.length} configuración${productosValidos.length !== 1 ? 'es' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
