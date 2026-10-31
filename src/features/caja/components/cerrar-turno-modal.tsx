import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { useNavigate } from '@tanstack/react-router'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { CurrencyInput } from '@/components/shared/currency-input'
import { showApiError } from '@/lib/handle-server-error'
import { type TurnoCaja } from '@/types/models'
import {
  useCajaMutations,
  usePreCierre,
  useResumenTurnoActivo,
} from '../hooks/use-caja'

const cerrarTurnoSchema = z.object({
  monto_cierre: z
    .number({ error: 'Ingresa un monto válido' })
    .min(0, 'El monto no puede ser negativo'),
  observaciones: z.string().optional(),
})

type CerrarTurnoFormValues = z.infer<typeof cerrarTurnoSchema>

interface CerrarTurnoModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  cajaId: number
  turno: TurnoCaja
}

function formatCurrency(value: number | string | undefined): string {
  if (value === undefined || value === null) return '$0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(num)
}

export function CerrarTurnoModal({
  open,
  onOpenChange,
  cajaId,
  turno,
}: CerrarTurnoModalProps) {
  const navigate = useNavigate()
  const { cerrarTurno } = useCajaMutations(cajaId)
  const {
    data: preCierre,
    isLoading: preCierreLoading,
    refetch: refetchPreCierre,
  } = usePreCierre(cajaId, open)
  const { data: resumen, isLoading: resumenLoading } = useResumenTurnoActivo(
    cajaId,
    open
  )

  const form = useForm<CerrarTurnoFormValues>({
    resolver: zodResolver(cerrarTurnoSchema),
    defaultValues: { monto_cierre: 0, observaciones: '' },
  })

  const montoCierre = useWatch({ control: form.control, name: 'monto_cierre' })

  const efectivoEsperado = resumen
    ? parseFloat(resumen.efectivo_esperado)
    : undefined
  const montoCierreVal = typeof montoCierre === 'number' ? montoCierre : 0
  const diferencia =
    efectivoEsperado !== undefined ? montoCierreVal - efectivoEsperado : undefined

  const bloqueado = preCierre ? !preCierre.puede_cerrar : false

  function onSubmit(values: CerrarTurnoFormValues) {
    cerrarTurno.mutate(
      {
        monto_cierre: values.monto_cierre,
        observaciones: values.observaciones || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Turno cerrado correctamente')
          form.reset()
          onOpenChange(false)
        },
        onError: (error) => {
          // El cierre puede bloquearse entre el pre-chequeo y el submit
          if (
            isAxiosError(error) &&
            error.response?.data?.error?.code === 'CIERRE_CAJA_BLOQUEADO'
          ) {
            void refetchPreCierre()
          }
          showApiError(error, 'Error al cerrar el turno')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cerrar turno de caja</DialogTitle>
        </DialogHeader>

        {/* Bloqueos de cierre (pre-cierre) */}
        {preCierreLoading && <Skeleton className='h-16 w-full' />}
        {bloqueado && preCierre && (
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertTitle>No se puede cerrar la caja todavía</AlertTitle>
            <AlertDescription>
              <ul className='mt-2 space-y-1 text-sm'>
                {preCierre.juegos_en_curso.map((j) => (
                  <li key={`curso-${j.juego_id}`}>
                    <button
                      type='button'
                      className='inline-flex items-center gap-1 underline underline-offset-2'
                      onClick={() => navigate({ to: '/juegos' })}
                    >
                      {j.mesa}: juego en curso
                      <ExternalLink className='h-3 w-3' />
                    </button>
                  </li>
                ))}
                {preCierre.juegos_sin_cobrar.map((j) => (
                  <li key={`cobro-${j.juego_id}`}>
                    <button
                      type='button'
                      className='inline-flex items-center gap-1 underline underline-offset-2'
                      onClick={() => navigate({ to: '/juegos' })}
                    >
                      {j.mesa}: juego sin cobrar
                      <ExternalLink className='h-3 w-3' />
                    </button>
                  </li>
                ))}
                {preCierre.barras_abiertas.map((b) => (
                  <li key={`barra-${b.personal_id}`}>
                    <button
                      type='button'
                      className='inline-flex items-center gap-1 underline underline-offset-2'
                      onClick={() => navigate({ to: '/barra-admin' })}
                    >
                      Cuenta de barra sin facturar
                      {b.nombre ? ` — ${b.nombre}` : ''}
                      {b.descripcion ? ` (${b.descripcion})` : ''}
                      <ExternalLink className='h-3 w-3' />
                    </button>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Resumen de efectivo del turno */}
        {resumenLoading ? (
          <Skeleton className='h-32 w-full' />
        ) : resumen ? (
          <div className='space-y-1.5 rounded-lg bg-muted p-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Monto inicial (apertura)</span>
              <span className='font-medium'>
                {formatCurrency(resumen.monto_apertura)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Ventas en efectivo</span>
              <span className='font-medium'>
                {formatCurrency(resumen.por_metodo_pago?.efectivo ?? 0)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Ingresos manuales</span>
              <span className='font-medium'>
                +{formatCurrency(resumen.ingresos_manuales)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Egresos manuales</span>
              <span className='font-medium'>
                −{formatCurrency(resumen.egresos_manuales)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Comisiones de meseras</span>
              <span className='font-medium'>
                −{formatCurrency(resumen.total_comisiones)}
              </span>
            </div>
            <div className='flex justify-between border-t pt-2'>
              <span className='text-muted-foreground'>
                Efectivo esperado en caja
              </span>
              <span className='text-base font-semibold'>
                {formatCurrency(resumen.efectivo_esperado)}
              </span>
            </div>
            <p className='pt-1 text-xs text-muted-foreground'>
              Las ventas con tarjeta/transferencia no suman al efectivo en caja;
              se reportan por método de pago.
            </p>
          </div>
        ) : (
          <div className='rounded-lg bg-muted p-3 text-sm space-y-2'>
            <div>
              <p className='text-muted-foreground'>Monto inicial (apertura)</p>
              <p className='text-base font-semibold'>
                {formatCurrency(Number(turno.monto_apertura) || 0)}
              </p>
            </div>
            <p className='text-xs text-muted-foreground'>
              No se pudo cargar el resumen del turno.
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='monto_cierre'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Efectivo físico contado</FormLabel>
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

            {diferencia !== undefined && (
              <div className='rounded-lg border p-3 text-sm'>
                <p className='text-muted-foreground'>Diferencia</p>
                <p
                  className={`text-base font-semibold ${
                    diferencia >= 0 ? 'text-green-600' : 'text-destructive'
                  }`}
                >
                  {diferencia >= 0 ? '+' : ''}
                  {formatCurrency(diferencia)}
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name='observaciones'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Notas sobre el cierre...'
                      rows={3}
                      {...field}
                    />
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
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                variant='destructive'
                disabled={cerrarTurno.isPending || preCierreLoading || bloqueado}
              >
                {cerrarTurno.isPending ? 'Cerrando...' : 'Cerrar turno'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
