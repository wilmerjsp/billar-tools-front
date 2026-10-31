import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Textarea } from '@/components/ui/textarea'

const schema = z.object({
  motivo: z
    .string()
    .min(1, 'El motivo es requerido')
    .max(200, 'Máximo 200 caracteres'),
})

type FormValues = z.infer<typeof schema>

interface RechazarPedidoDialogProps {
  open: boolean
  isPending: boolean
  onConfirm: (motivo: string) => void
  onClose: () => void
}

export function RechazarPedidoDialog({
  open,
  isPending,
  onConfirm,
  onClose,
}: RechazarPedidoDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { motivo: '' },
  })

  function handleSubmit(values: FormValues) {
    onConfirm(values.motivo)
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      form.reset()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Rechazar pedido</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='motivo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo del rechazo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Ej: Sin stock de cerveza'
                      className='resize-none'
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type='submit' variant='destructive' disabled={isPending}>
                Rechazar pedido
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
