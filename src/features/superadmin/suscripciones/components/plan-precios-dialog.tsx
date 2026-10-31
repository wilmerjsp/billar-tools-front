import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useSetPrecio } from '../hooks/use-suscripciones'
import type { PlanSuscripcion, PeriodoFacturacion } from '../types'
import { showApiError } from '@/lib/handle-server-error'

const schema = z.object({
  precio_mes: z.string().optional(),
  precio_semestre: z.string().optional(),
  precio_anual: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const PERIODOS: { key: keyof FormValues; label: string; periodo: PeriodoFacturacion }[] = [
  { key: 'precio_mes', label: 'Mensual', periodo: 'mes' },
  { key: 'precio_semestre', label: 'Semestral', periodo: 'semestre' },
  { key: 'precio_anual', label: 'Anual', periodo: 'anual' },
]

interface PlanPreciosDialogProps {
  plan: PlanSuscripcion | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlanPreciosDialog({ plan, open, onOpenChange }: PlanPreciosDialogProps) {
  const { mutateAsync, isPending } = useSetPrecio()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { precio_mes: '', precio_semestre: '', precio_anual: '' },
  })

  useEffect(() => {
    if (plan) {
      const precioFor = (p: PeriodoFacturacion) =>
        plan.precios.find((pr) => pr.periodo === p)?.precio ?? ''
      form.reset({
        precio_mes: precioFor('mes'),
        precio_semestre: precioFor('semestre'),
        precio_anual: precioFor('anual'),
      })
    }
  }, [plan, form])

  async function onSubmit(values: FormValues) {
    if (!plan) return

    const updates: { key: keyof FormValues; periodo: PeriodoFacturacion }[] = [
      { key: 'precio_mes', periodo: 'mes' },
      { key: 'precio_semestre', periodo: 'semestre' },
      { key: 'precio_anual', periodo: 'anual' },
    ]

    const toUpdate = updates.filter(({ key }) => {
      const val = values[key]
      return val !== undefined && val !== ''
    })

    if (toUpdate.length === 0) {
      toast.error('Ingresa al menos un precio')
      return
    }

    try {
      await Promise.all(
        toUpdate.map(({ key, periodo }) =>
          mutateAsync({
            planId: plan.id,
            data: { periodo, precio: values[key]! },
          })
        )
      )
      toast.success('Precios actualizados')
      onOpenChange(false)
    } catch (error) {
      showApiError(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isPending) onOpenChange(v) }}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Precios: {plan?.nombre}</DialogTitle>
          <DialogDescription>
            Deja vacío los periodos que no apliquen para este plan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {PERIODOS.map(({ key, label }) => (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                          $
                        </span>
                        <Input
                          type='number'
                          min='0'
                          step='0.01'
                          placeholder='0.00'
                          className='pl-6'
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <div className='flex justify-end gap-2 pt-2'>
              <Button
                type='button'
                variant='outline'
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  <Save className='h-4 w-4' />
                )}
                Guardar precios
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
