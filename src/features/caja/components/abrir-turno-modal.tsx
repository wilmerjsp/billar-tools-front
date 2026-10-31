import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { CurrencyInput } from '@/components/shared/currency-input'
import { showApiError } from '@/lib/handle-server-error'
import { useCajaMutations } from '../hooks/use-caja'

const abrirTurnoSchema = z.object({
  monto_apertura: z.number().min(0, 'El monto no puede ser negativo'),
})

type AbrirTurnoFormValues = z.infer<typeof abrirTurnoSchema>

interface AbrirTurnoModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  cajaId: number
}

export function AbrirTurnoModal({
  open,
  onOpenChange,
  cajaId,
}: AbrirTurnoModalProps) {
  const { abrirTurno } = useCajaMutations(cajaId)

  const form = useForm<AbrirTurnoFormValues>({
    resolver: zodResolver(abrirTurnoSchema),
    defaultValues: { monto_apertura: 0 },
  })

  function onSubmit(values: AbrirTurnoFormValues) {
    abrirTurno.mutate(
      { monto_apertura: values.monto_apertura },
      {
        onSuccess: () => {
          toast.success('Turno abierto correctamente')
          form.reset()
          onOpenChange(false)
        },
        onError: (error) => {
          showApiError(error, 'Error al abrir el turno')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir turno de caja</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='monto_apertura'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto de apertura</FormLabel>
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
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={abrirTurno.isPending}>
                {abrirTurno.isPending ? 'Abriendo...' : 'Abrir turno'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
