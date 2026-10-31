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
import { useUpdatePlan } from '../hooks/use-suscripciones'
import type { PlanSuscripcion } from '../types'
import { showApiError } from '@/lib/handle-server-error'

const schema = z.object({
  max_admins: z.number().int().min(0, 'Mínimo 0'),
  max_cajas: z.number().int().min(0, 'Mínimo 0'),
  max_cajeros: z.number().int().min(0, 'Mínimo 0'),
  max_meseras: z.number().int().min(0, 'Mínimo 0'),
  activo: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface PlanEditDialogProps {
  plan: PlanSuscripcion | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlanEditDialog({ plan, open, onOpenChange }: PlanEditDialogProps) {
  const { mutateAsync, isPending } = useUpdatePlan()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      max_admins: 1,
      max_cajas: 1,
      max_cajeros: 1,
      max_meseras: 3,
      activo: true,
    },
  })

  useEffect(() => {
    if (plan) {
      form.reset({
        max_admins: plan.max_admins,
        max_cajas: plan.max_cajas,
        max_cajeros: plan.max_cajeros,
        max_meseras: plan.max_meseras,
        activo: plan.activo,
      })
    }
  }, [plan, form])

  async function onSubmit(values: FormValues) {
    if (!plan) return
    try {
      await mutateAsync({ planId: plan.id, data: values })
      toast.success(`Plan "${plan.nombre}" actualizado`)
      onOpenChange(false)
    } catch (error) {
      showApiError(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isPending) onOpenChange(v) }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Editar plan: {plan?.nombre}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={form.control}
                name='max_admins'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max. admins</FormLabel>
                    <FormControl>
                      <Input type='number' min={0} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='max_cajas'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max. cajas</FormLabel>
                    <FormControl>
                      <Input type='number' min={0} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='max_cajeros'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max. cajeros</FormLabel>
                    <FormControl>
                      <Input type='number' min={0} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='max_meseras'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max. meseras</FormLabel>
                    <FormControl>
                      <Input type='number' min={0} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='activo'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                  <FormLabel className='cursor-pointer'>Plan activo</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
