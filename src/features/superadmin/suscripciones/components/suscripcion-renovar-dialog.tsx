import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateSuscripcion, useRenovarSuscripcion, usePlanes } from '../hooks/use-suscripciones'
import type { PlanSuscripcion, SuscripcionDetalle } from '../types'
import { showApiError } from '@/lib/handle-server-error'

const PERIODOS = [
  { value: 'mes', label: 'Mensual' },
  { value: 'semestre', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
] as const

const schema = z.object({
  plan_id: z.number().min(1, 'Selecciona un plan'),
  periodo: z.enum(['mes', 'semestre', 'anual']),
})

type FormValues = z.infer<typeof schema>

interface SuscripcionRenovarDialogProps {
  billarId: number
  billarNombre: string
  suscripcion: SuscripcionDetalle | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SuscripcionRenovarDialog({
  billarId,
  billarNombre,
  suscripcion,
  open,
  onOpenChange,
}: SuscripcionRenovarDialogProps) {
  const isRenovar = suscripcion !== null
  const { data: planes = [] } = usePlanes()
  const createMutation = useCreateSuscripcion()
  const renovarMutation = useRenovarSuscripcion()

  const isPending = createMutation.isPending || renovarMutation.isPending

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      plan_id: suscripcion?.plan_id ?? 0,
      periodo: suscripcion?.periodo ?? 'mes',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        plan_id: suscripcion?.plan_id ?? 0,
        periodo: suscripcion?.periodo ?? 'mes',
      })
    }
  }, [open, suscripcion, form])

  const planesActivos = planes.filter((p: PlanSuscripcion) => p.activo && p.nombre !== 'demo')

  async function onSubmit(values: FormValues) {
    try {
      if (isRenovar) {
        await renovarMutation.mutateAsync({
          billarId,
          data: { plan_id: values.plan_id, periodo: values.periodo },
        })
        toast.success(`Suscripción de "${billarNombre}" renovada`)
      } else {
        await createMutation.mutateAsync({
          billar_id: billarId,
          plan_id: values.plan_id,
          periodo: values.periodo,
        })
        toast.success(`Suscripción asignada a "${billarNombre}"`)
      }
      onOpenChange(false)
    } catch (error) {
      showApiError(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isPending) onOpenChange(v) }}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>{isRenovar ? 'Renovar suscripción' : 'Asignar suscripción'}</DialogTitle>
          <DialogDescription>{billarNombre}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='plan_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Seleccionar plan' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {planesActivos.map((plan: PlanSuscripcion) => (
                        <SelectItem key={plan.id} value={String(plan.id)}>
                          {plan.nombre}
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
              name='periodo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Periodo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PERIODOS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                disabled={isPending}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='animate-spin' />}
                {isRenovar ? 'Renovar' : 'Asignar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
