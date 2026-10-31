import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
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
import { CurrencyInput } from '@/components/shared/currency-input'
import { showApiError } from '@/lib/handle-server-error'
import { useCrearMovimiento } from '../hooks/use-caja'

const movimientoSchema = z.object({
  tipo: z.enum(['ingreso', 'egreso']),
  concepto: z
    .string()
    .min(1, 'El concepto es requerido')
    .max(150, 'Máximo 150 caracteres'),
  monto: z.number({ error: 'Ingresa un monto válido' }).min(1, 'El monto debe ser mayor a 0'),
})

type MovimientoFormValues = z.infer<typeof movimientoSchema>

interface MovimientoCajaModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  cajaId: number
}

export function MovimientoCajaModal({
  open,
  onOpenChange,
  cajaId,
}: MovimientoCajaModalProps) {
  const crearMovimiento = useCrearMovimiento(cajaId)

  const form = useForm<MovimientoFormValues>({
    resolver: zodResolver(movimientoSchema),
    defaultValues: { tipo: 'egreso', concepto: '', monto: 0 },
  })

  function handleClose(v: boolean) {
    if (!v) form.reset()
    onOpenChange(v)
  }

  function onSubmit(values: MovimientoFormValues) {
    crearMovimiento.mutate(
      {
        tipo: values.tipo,
        concepto: values.concepto,
        monto: String(values.monto),
      },
      {
        onSuccess: () => {
          toast.success(
            values.tipo === 'ingreso'
              ? 'Ingreso registrado correctamente'
              : 'Egreso registrado correctamente'
          )
          handleClose(false)
        },
        onError: (error) => {
          showApiError(error, 'Error al registrar el movimiento')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar movimiento de efectivo</DialogTitle>
          <DialogDescription>
            Ingresos o egresos manuales del turno abierto (gastos, retiros,
            base adicional).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='tipo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='egreso'>Egreso (sale efectivo)</SelectItem>
                      <SelectItem value='ingreso'>Ingreso (entra efectivo)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='concepto'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concepto</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej: Compra de hielo' maxLength={150} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='monto'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <CurrencyInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
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
              <Button type='submit' disabled={crearMovimiento.isPending}>
                {crearMovimiento.isPending ? 'Registrando...' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
