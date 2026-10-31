import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMiTurnoActivo } from '@/features/caja/hooks/use-caja'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CurrencyInput } from '@/components/shared/currency-input'
import { usePreferencesStore } from '@/stores/preferences-store'
import { MetodoPago } from '@/types/enums'

const metodoPagoLabels: Record<MetodoPago, string> = {
  [MetodoPago.EFECTIVO]: 'Efectivo',
  [MetodoPago.TARJETA]: 'Tarjeta',
  [MetodoPago.TRANSFERENCIA]: 'Transferencia',
  [MetodoPago.MIXTO]: 'Mixto',
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

const schema = z.object({
  metodo_pago: z.nativeEnum(MetodoPago, { error: 'Selecciona un método de pago' }),
  monto_recibido: z.number().min(0).optional(),
})

type FormValues = z.infer<typeof schema>

interface EntregarPedidoDialogProps {
  open: boolean
  isPending: boolean
  total: number
  onConfirm: (metodo: MetodoPago) => void
  onClose: () => void
}

export function EntregarPedidoDialog({
  open,
  isPending,
  total,
  onConfirm,
  onClose,
}: EntregarPedidoDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { metodo_pago: MetodoPago.EFECTIVO, monto_recibido: 0 },
  })

  const { miTurno, isLoading: isTurnoLoading } = useMiTurnoActivo()

  const solicitarMontoRecibido = usePreferencesStore(
    (s) => s.solicitarMontoRecibido,
  )
  const metodoPago = useWatch({ control: form.control, name: 'metodo_pago' })
  const montoRecibido = useWatch({ control: form.control, name: 'monto_recibido' }) ?? 0
  const esEfectivo = metodoPago === MetodoPago.EFECTIVO
  const vuelto = montoRecibido - total

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      form.reset()
      onClose()
    }
  }

  function onSubmit(values: FormValues) {
    if (values.metodo_pago === MetodoPago.EFECTIVO && solicitarMontoRecibido) {
      const recibido = values.monto_recibido ?? 0
      if (recibido < total) {
        form.setError('monto_recibido', {
          message: 'El monto recibido debe ser mayor o igual al total',
        })
        return
      }
    }
    onConfirm(values.metodo_pago)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Método de pago</DialogTitle>
        </DialogHeader>

        <div className='rounded-lg bg-muted px-4 py-3 text-center'>
          <p className='text-xs text-muted-foreground'>Total a cobrar</p>
          <p className='text-2xl font-bold'>{formatCOP(total)}</p>
        </div>

        {isTurnoLoading ? (
          <Skeleton className='h-5 w-full' />
        ) : miTurno ? (
          <p className='text-center text-xs text-muted-foreground'>
            Se registrará en{' '}
            <span className='font-medium text-foreground'>
              {miTurno.caja_nombre ?? `Caja #${miTurno.caja_id}`}
            </span>{' '}
            — Turno #{miTurno.id}
          </p>
        ) : (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              No tienes un turno de caja abierto. Abre tu turno para registrar
              la entrega en tu caja.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='metodo_pago'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Cómo pagó el cliente?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecciona un método' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(MetodoPago).map((m) => (
                        <SelectItem key={m} value={m}>
                          {metodoPagoLabels[m]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {esEfectivo && solicitarMontoRecibido && (
              <>
                <FormField
                  control={form.control}
                  name='monto_recibido'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto recibido</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value ?? 0}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {montoRecibido > 0 && (
                  <div
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
                      vuelto >= 0
                        ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    <span>{vuelto >= 0 ? 'Vuelto' : 'Falta'}</span>
                    <span>{formatCOP(Math.abs(vuelto))}</span>
                  </div>
                )}
              </>
            )}

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isPending || !miTurno}>
                {isPending ? 'Procesando...' : 'Confirmar entrega'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
