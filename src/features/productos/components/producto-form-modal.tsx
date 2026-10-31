import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { PackageSearch, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { showApiError } from '@/lib/handle-server-error'

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CurrencyInput } from '@/components/shared/currency-input'
import { ProductoSelectorModal } from '@/components/shared/producto-selector-modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'

import { type Producto } from '@/types/models'
import { type ProductoPayload } from '../services/productos-service'
import { useCategorias, useProductoMutations, useProductos } from '../hooks/use-productos'

const productoSchema = z
  .object({
    categoria_id: z.number().min(1, 'Selecciona una categoría'),
    nombre: z.string().min(1, 'Nombre requerido'),
    descripcion: z.string().optional(),
    precio: z.number().min(0, 'El precio no puede ser negativo'),
    precio_costo: z.number().min(0, 'El costo no puede ser negativo'),
    imagen_url: z.string().url('URL inválida').optional().or(z.literal('')),
    disponible: z.boolean(),
    lleva_inventario: z.boolean(),
    es_combo: z.boolean(),
    combo_items: z.array(
      z.object({
        producto_id: z.number(),
        cantidad: z.number(),
      })
    ),
    stock_inicial: z.number().min(0, 'El stock no puede ser negativo'),
    stock_minimo: z.number().min(0, 'El stock mínimo no puede ser negativo'),
  })
  .superRefine((values, ctx) => {
    // Los componentes solo se validan cuando el producto es combo,
    // para no bloquear el submit con filas ocultas al desactivar el switch
    if (!values.es_combo) return

    if (values.combo_items.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['combo_items'],
        message: 'Un combo debe tener al menos un componente',
      })
    }
    const vistos = new Set<number>()
    values.combo_items.forEach((item, i) => {
      if (item.producto_id < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['combo_items', i, 'producto_id'],
          message: 'Selecciona un producto',
        })
      } else if (vistos.has(item.producto_id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['combo_items', i, 'producto_id'],
          message: 'Producto repetido en el combo',
        })
      }
      if (item.cantidad < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['combo_items', i, 'cantidad'],
          message: 'Mínimo 1',
        })
      }
      vistos.add(item.producto_id)
    })
  })

type ProductoFormValues = z.infer<typeof productoSchema>

interface ProductoFormModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  producto?: Producto
}

export function ProductoFormModal({
  open,
  onOpenChange,
  producto,
}: ProductoFormModalProps) {
  const { data: categorias, isLoading: loadingCategorias } = useCategorias()
  const { data: productos } = useProductos()
  const { create, update } = useProductoMutations()
  const isEditing = !!producto
  // Índice del componente del combo cuyo selector de producto está abierto
  const [comboSelectorIndex, setComboSelectorIndex] = useState<number | null>(null)

  const form = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      categoria_id: 0,
      nombre: '',
      descripcion: '',
      precio: 0,
      precio_costo: 0,
      imagen_url: '',
      disponible: true,
      lleva_inventario: false,
      es_combo: false,
      combo_items: [],
      stock_inicial: 0,
      stock_minimo: 0,
    },
  })

  const comboItems = useFieldArray({ control: form.control, name: 'combo_items' })

  const llevaInventario = form.watch('lleva_inventario')
  const esCombo = form.watch('es_combo')

  // Componentes elegibles: productos del billar que no sean combos ni el producto en edición
  const productosComponente = (productos ?? []).filter(
    (p) => !p.es_combo && p.id !== producto?.id
  )

  useEffect(() => {
    if (producto) {
      form.reset({
        categoria_id: producto.categoria_id,
        nombre: producto.nombre,
        descripcion: producto.descripcion ?? '',
        precio: Number(producto.precio),
        precio_costo: producto.precio_costo != null ? Number(producto.precio_costo) : 0,
        imagen_url: producto.imagen_url ?? '',
        disponible: producto.disponible,
        lleva_inventario: producto.lleva_inventario,
        es_combo: producto.es_combo ?? false,
        combo_items: (producto.combo_items ?? []).map((item) => ({
          producto_id: item.producto_id,
          cantidad: Number(item.cantidad),
        })),
        stock_inicial: 0,
        stock_minimo: 0,
      })
    } else {
      form.reset({
        categoria_id: 0,
        nombre: '',
        descripcion: '',
        precio: 0,
        precio_costo: 0,
        imagen_url: '',
        disponible: true,
        lleva_inventario: false,
        es_combo: false,
        combo_items: [],
        stock_inicial: 0,
        stock_minimo: 0,
      })
    }
  }, [producto, form])

  function onSubmit(values: ProductoFormValues) {
    const base: ProductoPayload = {
      categoria_id: values.categoria_id,
      nombre: values.nombre,
      descripcion: values.descripcion || undefined,
      precio: values.precio,
      // 0 se interpreta como "sin costo definido"
      precio_costo: values.precio_costo > 0 ? values.precio_costo : undefined,
      imagen_url: values.imagen_url || undefined,
      disponible: values.disponible,
      // El backend fuerza lleva_inventario: false en combos (stock virtual)
      lleva_inventario: values.es_combo ? false : values.lleva_inventario,
    }

    if (values.es_combo) {
      base.es_combo = true
      base.combo_items = values.combo_items
    }

    if (isEditing && producto) {
      // La composición solo se envía en combos (reemplaza la lista completa)
      update.mutate(
        { id: producto.id, data: base },
        {
          onSuccess: () => {
            toast.success('Producto actualizado correctamente')
            onOpenChange(false)
          },
          onError: (error) => {
            showApiError(error, 'Error al actualizar el producto')
          },
        }
      )
    } else {
      const payload: ProductoPayload = values.es_combo
        ? base
        : { ...base, stock_inicial: values.stock_inicial, stock_minimo: values.stock_minimo }
      create.mutate(payload, {
        onSuccess: () => {
          toast.success(values.es_combo ? 'Combo creado correctamente' : 'Producto creado correctamente')
          onOpenChange(false)
        },
        onError: (error) => {
          showApiError(error, 'Error al crear el producto')
        },
      })
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? producto?.es_combo
                ? 'Editar Combo'
                : 'Editar Producto'
              : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='nombre'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej. Coca-Cola 355ml' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='categoria_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  {loadingCategorias ? (
                    <Skeleton className='h-10 w-full' />
                  ) : (
                    <Select
                      value={field.value ? String(field.value) : ''}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Selecciona una categoría' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categorias?.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='precio'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de venta</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='precio_costo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo (opcional)</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='descripcion'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Descripción del producto...'
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='imagen_url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de imagen (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type='url'
                      placeholder='https://...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex flex-wrap gap-6'>
              <FormField
                control={form.control}
                name='disponible'
                render={({ field }) => (
                  <FormItem className='flex items-center gap-2 space-y-0'>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className='cursor-pointer'>Disponible</FormLabel>
                  </FormItem>
                )}
              />

              {!esCombo && (
                <FormField
                  control={form.control}
                  name='lleva_inventario'
                  render={({ field }) => (
                    <FormItem className='flex items-center gap-2 space-y-0'>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className='cursor-pointer'>Lleva inventario</FormLabel>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name='es_combo'
                render={({ field }) => (
                  <FormItem className='flex items-center gap-2 space-y-0'>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(v) => {
                          field.onChange(v)
                          if (v && comboItems.fields.length === 0) {
                            comboItems.append({ producto_id: 0, cantidad: 1 })
                          }
                        }}
                        // No se puede convertir un producto existente en combo ni viceversa
                        disabled={isEditing}
                      />
                    </FormControl>
                    <FormLabel className='cursor-pointer'>Es combo</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {esCombo && (
              <div className='space-y-3 rounded-md border p-3'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-medium'>Componentes del combo</p>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => comboItems.append({ producto_id: 0, cantidad: 1 })}
                  >
                    <Plus className='mr-1 h-3 w-3' />
                    Agregar
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground'>
                  El stock del combo es virtual: al venderlo se descuenta el
                  inventario de cada componente.
                </p>

                {comboItems.fields.map((item, index) => (
                  <div key={item.id} className='flex items-start gap-2'>
                    <FormField
                      control={form.control}
                      name={`combo_items.${index}.producto_id`}
                      render={({ field }) => {
                        const seleccionado = productosComponente.find(
                          (p) => p.id === field.value
                        )
                        return (
                          <FormItem className='flex-1'>
                            <FormControl>
                              <Button
                                type='button'
                                variant='outline'
                                className={cn(
                                  'w-full justify-start gap-2 font-normal',
                                  !seleccionado && 'text-muted-foreground'
                                )}
                                onClick={() => setComboSelectorIndex(index)}
                              >
                                <PackageSearch className='h-4 w-4' />
                                <span className='truncate'>
                                  {seleccionado ? seleccionado.nombre : 'Producto'}
                                </span>
                              </Button>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                    <FormField
                      control={form.control}
                      name={`combo_items.${index}.cantidad`}
                      render={({ field }) => (
                        <FormItem className='w-20'>
                          <FormControl>
                            <Input
                              type='number'
                              min={1}
                              step={1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      aria-label='Quitar componente'
                      onClick={() => comboItems.remove(index)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                ))}

                {form.formState.errors.combo_items?.root?.message && (
                  <p className='text-sm font-medium text-destructive'>
                    {form.formState.errors.combo_items.root.message}
                  </p>
                )}
                {form.formState.errors.combo_items?.message && (
                  <p className='text-sm font-medium text-destructive'>
                    {form.formState.errors.combo_items.message}
                  </p>
                )}
              </div>
            )}

            {!isEditing && !esCombo && llevaInventario && (
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='stock_inicial'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock inicial</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          step={1}
                          placeholder='0'
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='stock_minimo'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock mínimo</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          step={1}
                          placeholder='0'
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

      <ProductoSelectorModal
        title='Seleccionar componente'
        description='Busca por nombre el producto que hace parte del combo.'
        options={productosComponente.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          detalle: Number(p.precio).toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
          }),
        }))}
        open={comboSelectorIndex !== null}
        onOpenChange={(v) => {
          if (!v) setComboSelectorIndex(null)
        }}
        onSelect={(option) => {
          if (comboSelectorIndex !== null) {
            form.setValue(`combo_items.${comboSelectorIndex}.producto_id`, option.id, {
              shouldValidate: true,
            })
          }
        }}
      />
    </Dialog>
  )
}
