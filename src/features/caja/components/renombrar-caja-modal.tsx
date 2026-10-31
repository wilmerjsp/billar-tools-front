import { useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { showApiError } from '@/lib/handle-server-error'
import { type Caja } from '@/types/models'
import { useRenombrarCaja } from '../hooks/use-caja'

const renombrarCajaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
})

type RenombrarCajaFormValues = z.infer<typeof renombrarCajaSchema>

interface RenombrarCajaModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  caja: Caja | undefined
}

export function RenombrarCajaModal({
  open,
  onOpenChange,
  caja,
}: RenombrarCajaModalProps) {
  const renombrarCaja = useRenombrarCaja()

  const form = useForm<RenombrarCajaFormValues>({
    resolver: zodResolver(renombrarCajaSchema),
    defaultValues: { nombre: caja?.nombre ?? '' },
  })

  useEffect(() => {
    if (open) form.reset({ nombre: caja?.nombre ?? '' })
  }, [open, caja, form])

  function onSubmit(values: RenombrarCajaFormValues) {
    if (!caja) return
    renombrarCaja.mutate(
      { cajaId: caja.id, nombre: values.nombre },
      {
        onSuccess: () => {
          toast.success('Caja renombrada correctamente')
          onOpenChange(false)
        },
        onError: (error) => {
          showApiError(error, 'Error al renombrar la caja')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renombrar caja</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='nombre'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej: Caja Barra' {...field} />
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
              <Button type='submit' disabled={renombrarCaja.isPending}>
                {renombrarCaja.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
