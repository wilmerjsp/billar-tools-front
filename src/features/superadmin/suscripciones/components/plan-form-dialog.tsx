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
import { useCreatePlan } from '../hooks/use-suscripciones'
import { showApiError } from '@/lib/handle-server-error'

const schema = z.object({
  nombre: z.string().min(1, 'Requerido').max(50, 'Máximo 50 caracteres'),
  max_admins: z.number().int().min(0, 'Mínimo 0'),
  max_cajas: z.number().int().min(0, 'Mínimo 0'),
  max_cajeros: z.number().int().min(0, 'Mínimo 0'),
  max_meseras: z.number().int().min(0, 'Mínimo 0'),
})

type FormValues = z.infer<typeof schema>

interface PlanFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlanFormDialog({ open, onOpenChange }: PlanFormDialogProps) {
  const { mutateAsync, isPending } = useCreatePlan()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      max_admins: 1,
      max_cajas: 1,
      max_cajeros: 1,
      max_meseras: 3,
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      await mutateAsync(values)
      toast.success(`Plan "${values.nombre}" creado correctamente`)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      showApiError(error)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          form.reset()
          onOpenChange(v)
        }
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Nuevo plan</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='nombre'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='basico' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                Crear plan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
