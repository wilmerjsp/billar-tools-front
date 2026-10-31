import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { MetodoPago } from '@/types/enums'
import { useMiTurnoActivo } from '@/features/caja/hooks/use-caja'
import { useJuegoResumen, useFacturarJuego } from '../hooks/use-juegos'

const metodoPagoLabels: Record<MetodoPago, string> = {
  [MetodoPago.EFECTIVO]: 'Efectivo',
  [MetodoPago.TARJETA]: 'Tarjeta',
  [MetodoPago.TRANSFERENCIA]: 'Transferencia',
  [MetodoPago.MIXTO]: 'Mixto',
}

const schema = z.object({
  metodo_pago: z.nativeEnum(MetodoPago, { error: 'Selecciona un método de pago' }),
  descuento: z.coerce.number().min(0, 'El descuento no puede ser negativo').default(0),
})

type FormValues = z.infer<typeof schema>

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

interface FacturarJuegoModalProps {
  juegoId: number
  open: boolean
  onClose: () => void
}

export function FacturarJuegoModal({ juegoId, open, onClose }: FacturarJuegoModalProps) {
  const [numeroFactura, setNumeroFactura] = useState<string | null>(null)

  // El cobro se registra en el turno del usuario autenticado, no en la primera caja
  const { miTurno: turno, isLoading: isLoadingTurno } = useMiTurnoActivo()
  const { data: resumen, isLoading: isResumenLoading } = useJuegoResumen(juegoId)

  const { mutate: facturar, isPending } = useFacturarJuego()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { metodo_pago: MetodoPago.EFECTIVO, descuento: 0 },
  })

  const descuento = form.watch('descuento') ?? 0
  const totalConDescuento = resumen ? Math.max(0, resumen.total_juego - descuento) : null

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      form.reset()
      setNumeroFactura(null)
      onClose()
    }
  }

  function onSubmit(values: FormValues) {
    if (!turno) {
      toast.error('No tienes un turno de caja abierto')
      return
    }
    facturar(
      {
        id: juegoId,
        data: {
          turno_caja_id: turno.id,
          metodo_pago: values.metodo_pago,
          descuento: values.descuento,
        },
      },
      {
        onSuccess: (factura) => {
          setNumeroFactura(factura.numero_factura ?? String(factura.id))
          toast.success('Juego facturado correctamente')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Registrar cobro</DialogTitle>
        </DialogHeader>

        {numeroFactura ? (
          <div className='flex flex-col items-center gap-3 py-4 text-center'>
            <CheckCircle2 className='h-12 w-12 text-green-500' />
            <p className='text-sm text-muted-foreground'>Factura generada</p>
            <p className='text-lg font-bold'>{numeroFactura}</p>
            <Button className='mt-2' onClick={() => handleOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        ) : (
          <>
            {/* Resumen del juego */}
            {isResumenLoading ? (
              <div className='space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
              </div>
            ) : resumen ? (
              <div className='rounded-md border bg-muted/40 px-3 py-2 text-sm space-y-1'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Tiempo</span>
                  <span>{formatCurrency(resumen.costo_tiempo)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Consumos</span>
                  <span>{formatCurrency(resumen.total_consumos)}</span>
                </div>
                <Separator className='my-1' />
                <div className='flex justify-between font-semibold'>
                  <span>Total</span>
                  <span>{formatCurrency(resumen.total_juego)}</span>
                </div>
              </div>
            ) : null}

            {isLoadingTurno ? (
              <div className='space-y-3'>
                <Skeleton className='h-9 w-full' />
                <Skeleton className='h-9 w-full' />
              </div>
            ) : !turno ? (
              <p className='py-4 text-center text-sm text-destructive'>
                No tienes un turno de caja abierto. Abre tu turno antes de facturar.
              </p>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                  <p className='text-center text-xs text-muted-foreground'>
                    Se registrará en{' '}
                    <span className='font-medium text-foreground'>
                      {turno.caja_nombre ?? `Caja #${turno.caja_id}`}
                    </span>{' '}
                    — Turno #{turno.id}
                  </p>
                  <FormField
                    control={form.control}
                    name='metodo_pago'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de pago</FormLabel>
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

                  <FormField
                    control={form.control}
                    name='descuento'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descuento (opcional)</FormLabel>
                        <FormControl>
                          <Input type='number' min={0} placeholder='0' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {totalConDescuento !== null && descuento > 0 && (
                    <p className='text-right text-sm font-semibold'>
                      Total a cobrar:{' '}
                      <span className='text-primary'>{formatCurrency(totalConDescuento)}</span>
                    </p>
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
                    <Button type='submit' disabled={isPending || !turno}>
                      {isPending ? 'Procesando...' : 'Confirmar cobro'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
