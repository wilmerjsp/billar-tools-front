import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { PackageSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Switch } from '@/components/ui/switch'
import { CurrencyInput } from '@/components/shared/currency-input'
import { cn } from '@/lib/utils'
import { showApiError } from '@/lib/handle-server-error'
import { ProductoSelectorModal } from '@/components/shared/producto-selector-modal'
import { useInventario, useRegistrarCompra } from '../hooks/use-inventario'

const compraSchema = z.object({
  producto_id: z.number().min(1, 'Selecciona un producto'),
  cantidad: z.number({ error: 'Ingresa una cantidad válida' }).min(1, 'Mínimo 1'),
  costo_unitario: z
    .number({ error: 'Ingresa un costo válido' })
    .min(1, 'El costo debe ser mayor a 0'),
  nota: z.string().max(100, 'Máximo 100 caracteres').optional(),
  actualizar_precio_costo: z.boolean(),
})

type CompraFormValues = z.infer<typeof compraSchema>

interface CompraModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function CompraModal({ open, onOpenChange }: CompraModalProps) {
  const { data: inventario } = useInventario()
  const registrarCompra = useRegistrarCompra()
  const [selectorOpen, setSelectorOpen] = useState(false)

  const form = useForm<CompraFormValues>({
    resolver: zodResolver(compraSchema),
    defaultValues: {
      producto_id: 0,
      cantidad: 0,
      costo_unitario: 0,
      nota: '',
      actualizar_precio_costo: true,
    },
  })

  function handleClose(v: boolean) {
    if (!v) form.reset()
    onOpenChange(v)
  }

  function onSubmit(values: CompraFormValues) {
    registrarCompra.mutate(
      {
        producto_id: values.producto_id,
        cantidad: String(values.cantidad),
        costo_unitario: String(values.costo_unitario),
        nota: values.nota || undefined,
        actualizar_precio_costo: values.actualizar_precio_costo,
      },
      {
        onSuccess: () => {
          toast.success('Compra registrada correctamente')
          handleClose(false)
        },
        onError: (error) => {
          showApiError(error, 'Error al registrar la compra')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar compra</DialogTitle>
          <DialogDescription>
            Entrada de inventario por compra, con costo unitario.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='producto_id'
              render={({ field }) => {
                const seleccionado = inventario?.find(
                  (item) => item.producto_id === field.value
                )
                return (
                  <FormItem>
                    <FormLabel>Producto</FormLabel>
                    <FormControl>
                      <Button
                        type='button'
                        variant='outline'
                        className={cn(
                          'w-full justify-start gap-2 font-normal',
                          !seleccionado && 'text-muted-foreground'
                        )}
                        onClick={() => setSelectorOpen(true)}
                      >
                        <PackageSearch className='h-4 w-4' />
                        {seleccionado
                          ? seleccionado.producto.nombre
                          : 'Selecciona un producto'}
                      </Button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='cantidad'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        step={1}
                        placeholder='0'
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='costo_unitario'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo unitario</FormLabel>
                    <FormControl>
                      <CurrencyInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='nota'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ej: Compra distribuidor'
                      maxLength={100}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='actualizar_precio_costo'
              render={({ field }) => (
                <FormItem className='flex items-center gap-2 space-y-0'>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className='cursor-pointer font-normal'>
                    Actualizar el costo del producto con este último costo
                  </FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleClose(false)}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={registrarCompra.isPending}>
                {registrarCompra.isPending ? 'Registrando...' : 'Registrar compra'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <ProductoSelectorModal
        options={(inventario ?? []).map((item) => ({
          id: item.producto_id,
          nombre: item.producto.nombre,
          detalle: `Stock: ${item.stock_actual} ${item.unidad}`,
        }))}
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onSelect={(option) =>
          form.setValue('producto_id', option.id, {
            shouldValidate: true,
          })
        }
      />
    </Dialog>
  )
}
