import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { API_ERROR_TOAST_ID, showApiError } from '@/lib/handle-server-error'
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
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
import type { ConfigComision } from '../types'
import type { Producto } from '@/types/models'

const configSchema = z.object({
  producto_id: z.number().min(1, 'Selecciona un producto'),
  precio_barra: z.number().min(0, 'El precio no puede ser negativo'),
})

type ConfigFormValues = z.infer<typeof configSchema>

interface ConfigFormModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  config?: ConfigComision & { producto?: Producto }
}

export function ConfigFormModal({ open, onOpenChange, config }: ConfigFormModalProps) {
  const isEditing = !!config

  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('all')

  const { data: productos, isLoading: loadingProductos } = useProductos()
  const { data: categorias } = useCategorias()
  const { data: configs } = useComisionConfigs()
  const { create, update } = useComisionConfigMutations()

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: { producto_id: 0, precio_barra: 0 },
  })

  const productoId = form.watch('producto_id')
  const precioVenta = productos?.find((p) => p.id === productoId)?.precio ?? 0
  const precioBarra = form.watch('precio_barra')
  const comisionUnitaria = Math.max(0, Number(precioVenta) - Number(precioBarra))

  const productosFiltrados = useMemo(() => {
    const base = isEditing
      ? (productos ?? [])
      : (productos ?? []).filter((p) => !configs?.some((c) => c.producto_id === p.id && c.activa))

    return base.filter((p) => {
      const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      const coincideCategoria =
        categoriaFiltro === 'all' || String(p.categoria_id) === categoriaFiltro
      return coincideNombre && coincideCategoria
    })
  }, [productos, configs, isEditing, busqueda, categoriaFiltro])

  useEffect(() => {
    if (open) {
      setBusqueda('')
      setCategoriaFiltro('all')
    }
  }, [open])

  useEffect(() => {
    if (config) {
      form.reset({
        producto_id: config.producto_id,
        precio_barra: Number(config.precio_barra),
      })
    } else {
      form.reset({ producto_id: 0, precio_barra: 0 })
    }
  }, [config, form])

  function onSubmit(values: ConfigFormValues) {
    if (isEditing && config) {
      update.mutate(
        { id: config.id, data: { precio_barra: values.precio_barra } },
        {
          onSuccess: () => {
            toast.success('Configuración actualizada')
            onOpenChange(false)
          },
          onError: (error) => {
            showApiError(error, 'Error al actualizar la configuración')
          },
        }
      )
    } else {
      create.mutate(values, {
        onSuccess: () => {
          toast.success('Configuración de comisión creada')
          onOpenChange(false)
        },
        onError: (error) => {
          const code =
            error instanceof AxiosError ? error.response?.data?.error?.code : undefined
          if (code === 'COMISION_DUPLICADA') {
            toast.error('Ya existe una configuración activa para ese producto', {
              id: API_ERROR_TOAST_ID,
            })
          } else if (code === 'PRECIO_BARRA_MAYOR') {
            toast.error('El precio barra no puede ser mayor al precio de venta', {
              id: API_ERROR_TOAST_ID,
            })
          } else {
            showApiError(error, 'Error al crear la configuración')
          }
        },
      })
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[460px]'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar configuración' : 'Nueva configuración de comisión'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='producto_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Producto</FormLabel>
                  {loadingProductos ? (
                    <Skeleton className='h-10 w-full' />
                  ) : isEditing ? (
                    <Input
                      disabled
                      value={config?.producto?.nombre ?? `Producto #${config?.producto_id}`}
                    />
                  ) : (
                    <div className='space-y-2'>
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

                      <Select
                        value={field.value ? String(field.value) : ''}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Selecciona un producto' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productosFiltrados.length === 0 ? (
                            <div className='py-3 text-center text-sm text-muted-foreground'>
                              Sin resultados
                            </div>
                          ) : (
                            productosFiltrados.map((p) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                {p.nombre}
                                {' — '}
                                {Number(p.precio).toLocaleString('es-CO', {
                                  style: 'currency',
                                  currency: 'COP',
                                  maximumFractionDigits: 0,
                                })}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='precio_barra'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio barra</FormLabel>
                  <FormControl>
                    <CurrencyInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>
                    Precio al que la barra le vende a la mesera (debe ser ≤ precio de venta).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {productoId > 0 && (
              <div className='rounded-md border bg-muted/40 px-4 py-3 text-sm space-y-1'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Precio de venta</span>
                  <span>
                    {Number(precioVenta).toLocaleString('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Precio barra</span>
                  <span>
                    {Number(precioBarra).toLocaleString('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className='flex justify-between font-semibold'>
                  <span>Comisión unitaria</span>
                  <span className={comisionUnitaria > 0 ? 'text-green-600' : 'text-muted-foreground'}>
                    {comisionUnitaria.toLocaleString('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
