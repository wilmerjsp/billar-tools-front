import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { showApiError } from '@/lib/handle-server-error'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { TipoAjusteInventario } from '@/types/enums'
import { useAjusteStockMutation } from '../hooks/use-inventario'

const ajusteSchema = z.object({
  tipo: z.nativeEnum(TipoAjusteInventario),
  cantidad: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  motivo: z.string().min(1, 'El motivo es requerido'),
})

type AjusteFormValues = z.infer<typeof ajusteSchema>

interface AjusteStockModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  productoId: number
  productoNombre: string
}

export function AjusteStockModal({
  open,
  onOpenChange,
  productoId,
  productoNombre,
}: AjusteStockModalProps) {
  const ajuste = useAjusteStockMutation()

  const form = useForm<AjusteFormValues>({
    resolver: zodResolver(ajusteSchema),
    defaultValues: {
      tipo: TipoAjusteInventario.ENTRADA,
      cantidad: 1,
      motivo: '',
    },
  })

  function onSubmit(values: AjusteFormValues) {
    ajuste.mutate(
      {
        producto_id: productoId,
        tipo: values.tipo,
        cantidad: values.cantidad,
        motivo: values.motivo,
      },
      {
        onSuccess: () => {
          toast.success('Ajuste de stock registrado correctamente')
          form.reset()
          onOpenChange(false)
        },
        onError: (error) => {
          showApiError(error, 'Error al registrar el ajuste de stock')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[420px]'>
        <DialogHeader>
          <DialogTitle>Ajustar Stock</DialogTitle>
          <DialogDescription>{productoNombre}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='tipo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de ajuste</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecciona el tipo' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={TipoAjusteInventario.ENTRADA}>
                        Entrada
                      </SelectItem>
                      <SelectItem value={TipoAjusteInventario.AJUSTE}>
                        Ajuste
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='motivo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej. Compra a proveedor' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={ajuste.isPending}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={ajuste.isPending}>
                {ajuste.isPending ? 'Guardando...' : 'Registrar ajuste'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
